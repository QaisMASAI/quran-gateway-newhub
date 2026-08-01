import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/concepts/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "concept", slug: params.slug } });
  },
});
