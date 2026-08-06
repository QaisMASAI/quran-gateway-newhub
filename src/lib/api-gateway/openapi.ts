/**
 * Quran Gateway — OpenAPI 3.0.3 Auto-Generator Registry
 */

export interface OpenApiSchemaObject {
  type?: string;
  properties?: Record<string, OpenApiSchemaObject>;
  required?: string[];
  items?: OpenApiSchemaObject;
  description?: string;
  example?: unknown;
  enum?: string[];
}

export interface OpenApiParameterObject {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema: OpenApiSchemaObject;
}

export interface OpenApiRouteSpec {
  path: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  summary: string;
  description: string;
  tags: string[];
  deprecated?: boolean;
  parameters?: OpenApiParameterObject[];
  requestBody?: {
    required?: boolean;
    content: {
      "application/json": {
        schema: OpenApiSchemaObject;
      };
    };
  };
  responses: Record<
    string,
    {
      description: string;
      content?: {
        "application/json": {
          schema: OpenApiSchemaObject;
        };
      };
    }
  >;
}

class OpenApiSpecRegistry {
  private routes: OpenApiRouteSpec[] = [];

  public registerRoute(spec: OpenApiRouteSpec): void {
    this.routes.push(spec);
  }

  public generateDocument() {
    const paths: Record<string, Record<string, unknown>> = {};

    for (const route of this.routes) {
      if (!paths[route.path]) {
        paths[route.path] = {};
      }

      paths[route.path][route.method] = {
        summary: route.summary,
        description: route.description,
        tags: route.tags,
        deprecated: route.deprecated || false,
        parameters: route.parameters || [],
        ...(route.requestBody ? { requestBody: route.requestBody } : {}),
        responses: route.responses,
      };
    }

    return {
      openapi: "3.0.3",
      info: {
        title: "Quran Gateway Unified API Gateway",
        version: "1.0.0",
        description:
          "Centralized, high-performance API gateway for the Quran Gateway platform, providing access to Quranic ayat, translations, Tafsir, Hadith collections, AI search, and reading habits.",
        contact: {
          name: "Quran Gateway Engineering Team",
          email: "api@qurangateway.org",
        },
        license: {
          name: "MIT",
        },
      },
      servers: [
        {
          url: "https://ais-dev-vuvcxhrv2br5zzyszmvam6-768044802339.europe-west2.run.app",
          description: "Active Development Gateway Node",
        },
        {
          url: "http://localhost:3000",
          description: "Local Server Node",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "User Bearer token or QURAN_ADMIN_TOKEN secret.",
          },
        },
        schemas: {
          ApiEnvelope: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object", description: "Payload data object" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  numericCode: { type: "integer" },
                  message: { type: "string" },
                  domain: { type: "string" },
                  httpStatus: { type: "integer" },
                  remediation: { type: "string" },
                },
              },
              meta: {
                type: "object",
                properties: {
                  requestId: { type: "string" },
                  timestamp: { type: "string" },
                  path: { type: "string" },
                  version: { type: "string" },
                  processingTimeMs: { type: "integer" },
                },
              },
            },
          },
        },
      },
      paths,
    };
  }
}

export const openApiRegistry = new OpenApiSpecRegistry();

// Pre-register core routes in OpenAPI Registry
openApiRegistry.registerRoute({
  path: "/api/v1/quran/verses/{surah}",
  method: "get",
  summary: "Get Quran Verses for a Surah",
  description:
    "Fetch ordered ayat for a given Surah number with optional translations, tafsir snippets, and pagination.",
  tags: ["Quran Corpus"],
  parameters: [
    {
      name: "surah",
      in: "path",
      required: true,
      description: "Surah number (1 to 114)",
      schema: { type: "string" },
    },
    {
      name: "page",
      in: "query",
      description: "Page number (1-indexed)",
      schema: { type: "integer", example: 1 },
    },
    {
      name: "limit",
      in: "query",
      description: "Number of verses per page (1-100)",
      schema: { type: "integer", example: 20 },
    },
    {
      name: "translations",
      in: "query",
      description: "Comma-separated translation source codes (e.g. hebrew-he,english-clearquran)",
      schema: { type: "string" },
    },
    {
      name: "includeTafsir",
      in: "query",
      description: "Include snippet of tafsir for each verse",
      schema: { type: "boolean" },
    },
  ],
  responses: {
    "200": {
      description: "Successful response returning Quran verses and metadata.",
    },
    "404": {
      description: "Surah or requested translation not found.",
    },
  },
});

openApiRegistry.registerRoute({
  path: "/api/v1/search",
  method: "post",
  summary: "Unified Search Engine Endpoint",
  description:
    "Execute hybrid semantic and exact term search across Quran, Tafsir, Hadith, and Knowledge Graph entities.",
  tags: ["Search & AI"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description: "Search query text",
              example: "patience and gratitude",
            },
            mode: {
              type: "string",
              enum: ["hybrid", "semantic", "keyword", "exact"],
              example: "hybrid",
            },
            limit: { type: "integer", example: 10 },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Search results matching query.",
    },
    "400": {
      description: "Empty or invalid query payload.",
    },
  },
});

openApiRegistry.registerRoute({
  path: "/api/v1/user/progress",
  method: "get",
  summary: "User Reading Progress & Daily Habits",
  description:
    "Retrieve current reading streak, total verses completed, active plan progress, and habit history logs.",
  tags: ["User & Habits"],
  responses: {
    "200": {
      description: "User progress payload.",
    },
    "401": {
      description: "Unauthorized access — token missing or invalid.",
    },
  },
});
