import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hadith/bukhari")({
  beforeLoad: () => {
    throw redirect({ to: "/hadith/$collection", params: { collection: "bukhari" } });
  },
});