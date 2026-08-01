import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/books/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/learn/$kind/$slug", params: { kind: "book", slug: params.slug } });
  },
});
