import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AdminRoute from "./routes/AdminRoute";
import RequireAuth from "./routes/RequireAuth";

import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";

import AdminHomePage from "./pages/admin/AdminHomePage";
import ManagePerfumesPage from "./pages/admin/ManagePerfumesPage";
import ManageOredrsPage from "./pages/admin/ManageOredrsPage";
import EditPerfumePage from "./pages/admin/EditPerfumePage";
import CreatePerfumePage from "./pages/admin/CreatePerfumePage";
import AdminStatsPage from "./pages/admin/AdminStatsPage";

export default function App() {
  return (
    <Routes>
      {/* Tout ce qui est ici aura le NavBar via MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<ProductsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />

        <Route path="auth" element={<AuthPage />} />
        <Route path="cart" element={<CartPage />} />

        {/* Admin */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminHomePage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/perfumes/manage"
          element={
            <AdminRoute>
              <ManagePerfumesPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/perfumes/new"
          element={
            <AdminRoute>
              <CreatePerfumePage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/perfumes/:id/edit"
          element={
            <AdminRoute>
              <EditPerfumePage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/orders"
          element={
            <AdminRoute>
              <ManageOredrsPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/stats"
          element={
            <AdminRoute>
              <AdminStatsPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
