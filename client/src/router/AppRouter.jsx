import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import Home from '../pages/Home/Home';
import ProductListing from '../pages/ProductListing/ProductListing';
import ProductDetail from '../pages/ProductDetail/ProductDetail';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Checkout from '../pages/Checkout/Checkout';
import PaymentSuccess from '../pages/PaymentSuccess/PaymentSuccess';
import PaymentPending from '../pages/PaymentPending/PaymentPending';
import PaymentFailure from '../pages/PaymentFailure/PaymentFailure';
import Orders from '../pages/Orders/Orders';
import Account from '../pages/Account/Account';

import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders/AdminOrders';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<ProductListing />} />
        <Route path="/produtos/:slug" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/pagamento/sucesso" element={<PaymentSuccess />} />
        <Route path="/pagamento/pendente" element={<PaymentPending />} />
        <Route path="/pagamento/falha" element={<PaymentFailure />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/meus-pedidos" element={<Orders />} />
          <Route path="/minha-conta" element={<Account />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/produtos" element={<AdminProducts />} />
          <Route path="/admin/pedidos" element={<AdminOrders />} />
        </Route>
      </Route>

      <Route path="*" element={<Layout />} />
    </Routes>
  );
}
