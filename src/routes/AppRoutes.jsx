import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layout
const Layout = lazy(() => import("../components/layout/Layout"));

// Pages (Lazy Loaded)
const Dashboard = lazy(() => import("../components/pages/Dashboard"));
const Profile = lazy(() => import("../components/pages/Profile"));
const Settings = lazy(() => import("../components/pages/Settings"));
const Login = lazy(() => import("../components/pages/Login"));

const Category = lazy(() => import("../components/pages/Category"));
const SubCategory = lazy(() => import("../components/pages/Subcategory"));
const AppBanner = lazy(() => import("../components/pages/AppBanner"));
const Spotlight = lazy(() => import("../components/pages/Spotlight"));
const Designer = lazy(() => import("../components/pages/Designer"));

const CurrentDeals = lazy(() => import("../components/pages/CurrentDeals"));
const SuperSaveDeals = lazy(() => import("../components/pages/SuperSaveDeals"));

const ProductFeed = lazy(() => import("../components/pages/Product/ProductFeed"));
const ProductDetails = lazy(() => import("../components/pages/Product/ProductDetails"));

import ProtectedRoute from "./ProtectedRoute";

/* Loading fallback */
function Loader() {
  return (
    <div className="w-full h-screen flex items-center justify-center text-pink-600 text-xl font-semibold">
      Loading...
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Login */}
        <Route
          path="/login"
          element={
            <LoginRedirect>
              <Login />
            </LoginRedirect>
          }
        />

        {/* Protected Main Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* MASTER PAGES */}
          <Route path="add/category" element={<Category />} />
          <Route path="add/subcategory" element={<SubCategory />} />
          <Route path="add/appbanner" element={<AppBanner />} />
          <Route path="add/spotlight" element={<Spotlight />} />
          <Route path="add/designer" element={<Designer />} />
          <Route path="add/currentdeals" element={<CurrentDeals />} />
          <Route path="add/superdeals" element={<SuperSaveDeals />} />

          {/* PRODUCTS */}
          <Route path="products" element={<ProductFeed />} />
          <Route path="product/:id" element={<ProductDetails />} />

          {/* Settings */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
}

/* ---------------------------------
   Prevent logged users from login page
---------------------------------- */
function LoginRedirect({ children }) {
  const admin = localStorage.getItem("admin");
  return admin ? <Navigate to="/" replace /> : children;
}
