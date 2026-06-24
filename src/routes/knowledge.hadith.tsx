import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/knowledge/hadith")({
  beforeLoad: () => {
    throw redirect({ to: "/hadith" });
  },
});