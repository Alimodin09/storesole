import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import AdminProductCreate from './pages/admin/ProductCreate.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminOrderDetails from './pages/admin/OrderDetails.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import RiderLogin from './pages/rider/RiderLogin.jsx';
import RiderRegister from './pages/rider/RiderRegister.jsx';
import RiderDashboard from './pages/rider/RiderDashboard.jsx';
import RiderLayout from './layouts/RiderLayout.jsx';
import RequireRole from './components/RequireRole.jsx';

function NotFound() {
    return (
        <section className="page page--not-found">
            <div className="container">
                <h1>Page not found</h1>
                <p>The page you requested does not exist.</p>
            </div>
        </section>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route
                        path="/orders"
                        element={(
                            <RequireRole role="customer" redirectTo="/login">
                                <Orders />
                            </RequireRole>
                        )}
                    />
                    <Route
                        path="/orders/:id"
                        element={(
                            <RequireRole role="customer" redirectTo="/login">
                                <OrderDetails />
                            </RequireRole>
                        )}
                    />
                    <Route
                        path="/profile"
                        element={(
                            <RequireRole role="customer" redirectTo="/login">
                                <Profile />
                            </RequireRole>
                        )}
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Route>

                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Dashboard Routes */}
                <Route
                    path="/admin"
                    element={(
                        <RequireRole role="admin" redirectTo="/admin/login">
                            <AdminLayout />
                        </RequireRole>
                    )}
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/create" element={<AdminProductCreate />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetails />} />
                </Route>

                <Route path="*" element={<NotFound />} />

                <Route path="/rider/login" element={<RiderLogin />} />
                <Route path="/rider/register" element={<RiderRegister />} />

                <Route
                    path="/rider"
                    element={(
                        <RequireRole role="rider" redirectTo="/rider/login">
                            <RiderLayout />
                        </RequireRole>
                    )}
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<RiderDashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}