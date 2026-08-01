import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/scholars/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "scholar", slug: params.slug } });
  },
});
