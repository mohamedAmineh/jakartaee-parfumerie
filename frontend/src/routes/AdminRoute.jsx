import { Navigate } from "react-router-dom";

const getRoleValue = (role) => {
  if (!role) return "";
  if (typeof role === "string") return role;
  if (typeof role === "object") {
    if (role.name) return role.name;
    if (role.role) return role.role;
  }
  return String(role);
};

const isAdminUser = (user) => getRoleValue(user?.role).toUpperCase() === "ADMIN";

export default function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminUser(user)) return <Navigate to="/" replace />;

  return children;
}
