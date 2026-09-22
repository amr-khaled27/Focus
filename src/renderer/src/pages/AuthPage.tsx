import { Navigate } from "react-router-dom";
import useSettingsStore from "@renderer/store/settings";
import AdminSignUp from "@renderer/components/Auth/AdminSignUp";
import UserLogin from "@renderer/components/Auth/UserLogin";

export default function AuthPage() {
  const { isAdminInitialized, isAuthenticated, isChecking } =
    useSettingsStore();

  if (isChecking || isAdminInitialized === null) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/pos" replace />;
  }

  if (!isAdminInitialized) {
    return <AdminSignUp />;
  }

  return <UserLogin />;
}
