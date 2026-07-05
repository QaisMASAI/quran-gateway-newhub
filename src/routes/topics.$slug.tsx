import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/topics/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "topic", slug: params.slug } });
  },
});
