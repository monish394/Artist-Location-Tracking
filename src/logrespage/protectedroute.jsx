// src/logrespage/protectedroute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRole && role !== allowedRole) {
    if (role === "admin") return <Navigate to="/adminhome" replace />;
    if (role === "artist") return <Navigate to="/artisthome" replace />;
    if (role === "fan") return <Navigate to="/fanhome" replace />;

 
    return <Navigate to="/login" replace />;
  }


  return children;
}