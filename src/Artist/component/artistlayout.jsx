// src/Artist/component/ArtistLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import ArtistNavbar from "./artistnav";

const ArtistLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ArtistNavbar />
      <main className="">
        <Outlet />
      </main>
    </div>
  );
};

export default ArtistLayout;