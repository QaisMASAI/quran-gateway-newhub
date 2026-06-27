import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/prophets/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "prophet", slug: params.slug } });
  },
});


