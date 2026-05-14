import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// This route is no longer used — redirects straight to results
export const Route = createFileRoute("/quiz/$step")({
  component: QuizRedirect,
});

function QuizRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/results" });
  }, [navigate]);
  return null;
}
