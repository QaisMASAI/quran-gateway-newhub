import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/feedback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const { name, email, category, message } = body as {
            name?: string;
            email?: string;
            category?: string;
            message?: string;
          };

          if (!message || message.trim().length < 5) {
            return Response.json(
              { success: false, error: "Message must be at least 5 characters long." },
              { status: 400 },
            );
          }

          if (email && !email.includes("@")) {
            return Response.json(
              { success: false, error: "Please enter a valid email address." },
              { status: 400 },
            );
          }

          // In production, this can be saved to database or sent via email service
          console.log("[FEEDBACK RECEIVED]", {
            timestamp: new Date().toISOString(),
            name: name?.trim() || "Anonymous",
            email: email?.trim() || "N/A",
            category: category || "general",
            message: message.trim(),
          });

          return Response.json({
            success: true,
            message: "Thank you for your feedback! Your message has been received.",
            receivedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Feedback endpoint error", error);
          return Response.json(
            { success: false, error: "An error occurred while submitting feedback." },
            { status: 500 },
          );
        }
      },
    },
  },
});
