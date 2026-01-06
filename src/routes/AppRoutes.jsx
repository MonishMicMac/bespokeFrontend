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
const SizeMaster = lazy(() => import("../components/pages/SizeMaster"));
const MeasurementMaster = lazy(() => import("../components/pages/MeasurementMaster"));
const RoomMaster = lazy(() => import("../components/pages/RoomMaster"));
const WearTypeMaster = lazy(() => import("../components/pages/WearTypeMaster"));
const MeasurementMapping = lazy(() => import("../components/pages/MeasurementMapping"));
const MaterialMaster = lazy(() => import("../components/pages/MaterialMaster"));

const ProductFeed = lazy(() => import("../components/pages/Product/ProductFeed"));
const ProductDetails = lazy(() => import("../components/pages/Product/ProductDetails"));

import ProtectedRoute from "./ProtectedRoute";
import VendorList from "../components/pages/vendor/VendorList";
import Order from "../components/pages/order/Order";
import OrderDetail from "../components/pages/order/OrderDetails";
const VendorDetail = lazy(() => import("../components/pages/vendor/VendorDetail"));
const CustomerList = lazy(() => import("../components/pages/customer/CustomerList"));

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
          <Route path="add/sizemaster" element={<SizeMaster />} />
          <Route path="add/measurement" element={<MeasurementMaster />} />
          <Route path="add/appbanner" element={<AppBanner />} />
          <Route path="add/spotlight" element={<Spotlight />} />
          <Route path="add/designer" element={<Designer />} />
          <Route path="add/currentdeals" element={<CurrentDeals />} />
          <Route path="add/superdeals" element={<SuperSaveDeals />} />
          <Route path="add/room" element={<RoomMaster />} />
          <Route path="add/weartype" element={<WearTypeMaster />} />
          <Route path="add/measurement-mapping" element={<MeasurementMapping />} />
          <Route path="add/material" element={<MaterialMaster />} />

          {/* PRODUCTS */}
          <Route path="products" element={<ProductFeed />} />
          <Route path="product/:id" element={<ProductDetails />} />

          {/* Settings */}
          <Route path="VendorList" element={<VendorList />} />
          <Route path="vendor/details/:id" element={<VendorDetail />} />
          <Route path="CustomerList" element={<CustomerList />} />
          <Route path="orderlist" element={<Order />} />

          <Route path="orderDetails/:id" element={<OrderDetail />} />
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
