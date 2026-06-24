import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hadith/muslim")({
  beforeLoad: () => {
    throw redirect({ to: "/hadith/$collection", params: { collection: "muslim" } });
  },
});