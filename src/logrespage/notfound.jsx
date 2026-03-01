// src/logrespage/notfound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
        Oops! Page not found.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition"
      >
        Go to Login
      </button>
    </div>
  );
};

export default NotFound;