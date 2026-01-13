import NavBar from "../components/NavBar";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div style={styles.page} className={`${isAdmin ? "theme-admin" : "theme-client"} page-enter`}>
      <NavBar />
      <Outlet />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 12% 15%, rgba(255, 177, 136, 0.35), transparent 48%), radial-gradient(circle at 88% 18%, rgba(255, 107, 107, 0.18), transparent 52%), radial-gradient(circle at 50% 80%, rgba(255, 215, 194, 0.6), transparent 55%), #fffaf6",
  },
};
