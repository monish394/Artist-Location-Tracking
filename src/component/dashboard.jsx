import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(res.data.user);
      } catch (err) {
        console.log("Error fetching profile:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  if (!user) {
    return <h2 style={{ textAlign: "center" }}>No user logged in</h2>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: 40,color:"white" }}>
      <h2>Welcome {user.email}</h2>
      <p>Role: {user.role}</p>
    </div>
  );
}

export default Dashboard;