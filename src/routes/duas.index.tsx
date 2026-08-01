import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/duas/")({
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
});
