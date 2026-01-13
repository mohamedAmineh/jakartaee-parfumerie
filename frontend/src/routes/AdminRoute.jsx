import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../application/useCases/session";

const getRoleValue = (role) => {
  if (!role) return "";
  if (typeof role === "string") return role;
  if (typeof role === "object") return role.name ?? role.role ?? String(role);
  return String(role);
};

const isAdminUser = (user) => getRoleValue(user?.role).toUpperCase() === "ADMIN";

export default function AdminRoute({ children }) {
  const location = useLocation();

  const user = getCurrentUser();
  const auth = isAuthenticated();

  if (!auth || !user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
