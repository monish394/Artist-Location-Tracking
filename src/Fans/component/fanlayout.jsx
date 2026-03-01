// src/Fans/component/FanLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import FanNavbar from "./fannav";

const FanLayout = () => {
  return (
    <div className="min-h-screen bg-green-50">
      <FanNavbar />
      <main >
        <Outlet />
      </main>
    </div>
  );
};

export default FanLayout;