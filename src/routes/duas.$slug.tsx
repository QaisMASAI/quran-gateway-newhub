import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/duas/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "dua", slug: params.slug } });
  },
});
