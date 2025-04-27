import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/(auth)/role-selection" />;
  }

  if (user.role === "delivery" && user.status === "pending_approval") {
    return <Redirect href="/(auth)/pending-approval" />;
  }

  return <Redirect href="/(auth)/login" />; // Will create home later
}