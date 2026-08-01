import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/companions/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "companion", slug: params.slug } });
  },
});
