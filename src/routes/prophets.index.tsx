import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/prophets/")({
  beforeLoad: () => {
    throw redirect({ to: "/learn", hash: "prophets-library" });
  },
});
