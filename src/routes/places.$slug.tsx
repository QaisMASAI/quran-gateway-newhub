import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/places/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "place", slug: params.slug } });
  },
});
