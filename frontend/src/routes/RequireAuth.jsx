import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../application/useCases/session";

export default function RequireAuth({ children }) {
  const location = useLocation();
  const auth = isAuthenticated();

  if (!auth) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
