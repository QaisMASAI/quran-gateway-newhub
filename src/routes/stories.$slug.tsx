import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/stories/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "story", slug: params.slug } });
  },
});
