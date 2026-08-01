import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mosques/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "mosque", slug: params.slug } });
  },
});
