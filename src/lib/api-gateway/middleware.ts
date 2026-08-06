/**
 * Quran Gateway — Centralized Middleware Pipeline & Route Handler Factory
 */

import { ApiError, normalizeError } from "./errors";
import { enforceRateLimit } from "./rate-limiter";
import { gatewayMonitoring } from "./monitoring";
import type { ApiEnvelope, GatewayRequest, GatewayRouteConfig, AuthenticatedUser } from "./types";

/**
 * Generate cryptographically random request correlation ID
 */
export function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `req_${crypto.randomUUID()}`;
  }
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Parse client IP from Request headers
 */
export function extractClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  return "127.0.0.1";
}

/**
 * Parse query string parameters into a Record<string, string>
 */
export function parseQueryParams(url: URL): Record<string, string> {
  const query: Record<string, string> = {};
  url.searchParams.forEach((val, key) => {
    query[key] = val;
  });
  return query;
}

/**
 * Authenticate incoming request based on Authorization or Bearer token
 */
export async function authenticateGatewayRequest(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) return null;

  // Check internal admin token secret
  const adminToken = process.env.QURAN_ADMIN_TOKEN;
  if (adminToken && token === adminToken) {
    return {
      id: "admin-system",
      role: "admin",
      scopes: ["*"],
    };
  }

  // Supabase JWT session verification if token is present
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anonKey =
      process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && anonKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const {
        data: { user },
        error,
      } = await client.auth.getUser(token);
      if (user && !error) {
        return {
          id: user.id,
          email: user.email,
          role: (user.app_metadata?.role as "admin" | "user") || "user",
          scopes: ["read", "write"],
        };
      }
    }
  } catch {
    // Ignore verification errors and fall through
  }

  return null;
}

/**
 * Create a production-ready TanStack Start HTTP Handler with full Gateway Pipeline
 */
export function createGatewayHandler<TBody = unknown, TParams = Record<string, string>>(
  config: GatewayRouteConfig<TBody, TParams>,
) {
  return async ({
    request,
    params = {} as TParams,
  }: {
    request: Request;
    params?: TParams;
  }): Promise<Response> => {
    const startTime = performance.now();
    const requestId = generateRequestId();
    const url = new URL(request.url);
    const clientIp = extractClientIp(request);
    const query = parseQueryParams(url);

    let rateLimitHeaders: Record<string, string> = {};
    let authenticatedUser: AuthenticatedUser | null = null;
    let statusCode = 200;
    let errorDetail = null;

    try {
      // 1. Enforce Deprecation warnings if configured
      if (config.deprecated && config.sunsetDate && new Date(config.sunsetDate) < new Date()) {
        throw new ApiError(
          "SYS_NOT_IMPLEMENTED",
          `Endpoint ${config.path} has been sunset as of ${config.sunsetDate}. Please migrate to ${
            config.alternativeEndpoint || "/api/v2"
          }.`,
        );
      }

      // 2. Authenticate request if required or token present
      authenticatedUser = await authenticateGatewayRequest(request);
      if (config.requireAuth && !authenticatedUser) {
        throw new ApiError(
          "AUTH_UNAUTHORIZED",
          "Authentication is required to access this endpoint.",
        );
      }

      // 3. Enforce Scope permissions if required
      if (config.requiredScopes && config.requiredScopes.length > 0) {
        const userScopes = authenticatedUser?.scopes || [];
        const hasAllScopes = config.requiredScopes.every(
          (s) => userScopes.includes("*") || userScopes.includes(s),
        );
        if (!hasAllScopes) {
          throw new ApiError(
            "AUTH_INSUFFICIENT_SCOPES",
            `Required scopes: ${config.requiredScopes.join(", ")}`,
          );
        }
      }

      // 4. Rate Limiting Enforcement
      const rateLimitTier =
        config.rateLimitTier || (authenticatedUser ? "authenticated" : "anonymous");
      const rlResult = enforceRateLimit(
        clientIp,
        authenticatedUser?.id,
        rateLimitTier,
        config.rateLimitOverride,
      );
      rateLimitHeaders = rlResult.headers;

      // 5. Parse Request Body if method is POST, PUT, or PATCH
      let body: TBody = {} as TBody;
      if (["POST", "PUT", "PATCH"].includes(config.method)) {
        try {
          const text = await request.text();
          if (text.trim().length > 0) {
            body = JSON.parse(text) as TBody;
          }
        } catch {
          throw new ApiError("VAL_INVALID_PAYLOAD", "Failed to parse JSON body payload.");
        }
      }

      // 6. Execute Handler
      const gatewayReq: GatewayRequest<TBody, TParams> = {
        rawRequest: request,
        requestId,
        version: config.version,
        path: url.pathname,
        query,
        params,
        body,
        user: authenticatedUser,
        clientIp,
      };

      const result = await config.handler(gatewayReq);

      const processingTimeMs = Math.round(performance.now() - startTime);

      // Build Success Envelope
      const envelope: ApiEnvelope<unknown> = {
        success: true,
        data: result,
        error: null,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          path: url.pathname,
          version: config.version,
          processingTimeMs,
          rateLimit: rlResult.meta,
          ...(config.deprecated
            ? {
                deprecation: {
                  deprecated: true,
                  sunsetDate: config.sunsetDate,
                  alternativeEndpoint: config.alternativeEndpoint,
                },
              }
            : {}),
        },
      };

      // Record Metric
      gatewayMonitoring.recordRequest({
        requestId,
        endpoint: config.path,
        method: config.method,
        httpStatus: 200,
        durationMs: processingTimeMs,
        timestamp: new Date().toISOString(),
      });

      const responseHeaders = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "X-Request-ID": requestId,
        ...rateLimitHeaders,
      });

      if (config.deprecated) {
        responseHeaders.set("Deprecation", "true");
        if (config.sunsetDate) {
          responseHeaders.set("Sunset", new Date(config.sunsetDate).toUTCString());
        }
        if (config.alternativeEndpoint) {
          responseHeaders.set("Link", `<${config.alternativeEndpoint}>; rel="successor-version"`);
        }
      }

      return new Response(JSON.stringify(envelope), {
        status: 200,
        headers: responseHeaders,
      });
    } catch (err) {
      const processingTimeMs = Math.round(performance.now() - startTime);
      const normalizedErr = normalizeError(err);
      statusCode = normalizedErr.httpStatus;
      errorDetail = normalizedErr;

      // Build Error Envelope
      const envelope: ApiEnvelope<null> = {
        success: false,
        data: null,
        error: normalizedErr,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          path: url.pathname,
          version: config.version,
          processingTimeMs,
        },
      };

      // Record Error Metric
      gatewayMonitoring.recordRequest({
        requestId,
        endpoint: config.path,
        method: config.method,
        httpStatus: statusCode,
        durationMs: processingTimeMs,
        timestamp: new Date().toISOString(),
        errorDomain: normalizedErr.domain,
        errorCode: normalizedErr.code,
      });

      const responseHeaders = new Headers({
        "Content-Type": "application/json; charset=utf-8",
        "X-Request-ID": requestId,
        ...rateLimitHeaders,
      });

      return new Response(JSON.stringify(envelope), {
        status: statusCode,
        headers: responseHeaders,
      });
    }
  };
}
