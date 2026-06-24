import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/hadith/topics")({
  beforeLoad: () => {
    throw redirect({ to: "/learn", hash: "topics-library" });
  },
});