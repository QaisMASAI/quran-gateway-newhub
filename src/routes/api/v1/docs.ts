import { createFileRoute } from "@tanstack/react-router";
import { openApiRegistry } from "@/lib/api-gateway/openapi";
import { gatewayMonitoring } from "@/lib/api-gateway/monitoring";

export const Route = createFileRoute("/api/v1/docs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const format = url.searchParams.get("format");

        const spec = openApiRegistry.generateDocument();

        if (format === "json" || request.headers.get("accept")?.includes("application/json")) {
          return Response.json(spec, {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        // Render Redoc / Swagger UI Interactive Portal HTML
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Quran Gateway — API v1 Interactive Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; background-color: #0b1915; color: #f0fdf4; font-family: system-ui, sans-serif; }
    .top-bar { padding: 16px 24px; background: #064e3b; border-bottom: 1px solid #10b98133; display: flex; align-items: center; justify-content: space-between; }
    .top-bar h1 { margin: 0; font-size: 20px; color: #fef08a; }
    .top-bar p { margin: 4px 0 0; font-size: 13px; color: #a7f3d0; }
    .btn-json { background: #d97706; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; text-decoration: none; font-size: 13px; }
    .swagger-ui { background: #ffffff; border-radius: 12px; margin: 24px auto; max-width: 1200px; padding: 16px; }
  </style>
</head>
<body>
  <div class="top-bar">
    <div>
      <h1>📖 Quran Gateway API v1 Portal</h1>
      <p>OpenAPI 3.0.3 Specification & Interactive Endpoint Testing</p>
    </div>
    <a href="/api/v1/docs?format=json" target="_blank" class="btn-json">Raw OpenAPI JSON</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(spec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
      });
    };
  </script>
</body>
</html>`;

        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      },
    },
  },
});
