import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/scholars/")({
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
});
