import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mosques/")({
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
});
