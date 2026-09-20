import { Navigate, Outlet } from "react-router-dom";
import useSettingsStore from "@renderer/store/settings";

export const AdminGuard = () => {
  const { isAdminInitialized, isAuthenticated, isChecking } =
    useSettingsStore();

  if (isAdminInitialized === null || isChecking) {
    return null;
  }

  if (!isAdminInitialized || !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
