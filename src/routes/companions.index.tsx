import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/companions/")({
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
});
