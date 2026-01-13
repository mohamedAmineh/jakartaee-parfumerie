import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const auth = localStorage.getItem("auth");

  if (!auth) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
