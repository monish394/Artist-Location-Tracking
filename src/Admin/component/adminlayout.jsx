// src/Admin/component/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./adminnav";
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar stays the same for all admin pages */}
      <AdminNavbar />

      {/* Page content changes based on the route */}
      <main >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;