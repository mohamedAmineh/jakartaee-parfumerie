import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminRoute from "./routes/AdminRoute";
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AuthPage from './pages/AuthPage'
import AdminHomePage from "./pages/admin/AdminHomePage";
import CreatePerfumePage from "./pages/admin/CreatePerfumePage";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminHomePage />} />
          <Route path="/admin/perfumes/new" element={<CreatePerfumePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
