// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// Auth pages
import Login from "./logrespage/login.jsx";
import Register from "./logrespage/register.jsx";

// Artist pages
import ArtistLayout from "./Artist/component/artistlayout.jsx";
import ArtistHome from "./Artist/component/artisthome.jsx";
import ArtistEvents from "./Artist/component/artistevents.jsx";
import ArtistEventNew from "./Artist/component/artistcreateevent.jsx";
import ArtistEventEdit from "./Artist/component/artisteventedit.jsx";
import ArtistEventParticipants from "./Artist/component/artisteventparticipant.jsx";
import ArtistMap from "./Artist/component/artistmap.jsx";
import ArtistProfile from "./Artist/component/artistprofile.jsx";


//fan pages
import FanDashboard from "./Fans/component/fandashboard.jsx";
import FanEvents from "./Fans/component/fanevents.jsx";
import FanLayout from "./Fans/component/fanlayout.jsx";
import FanMap from "./Fans/component/fanmap.jsx";

import FanEventDetail from "./Fans/component/faneventsdetails.jsx";
import FanProfile from "./Fans/component/fanprofile.jsx";
import MyEvent from "./Fans/component/myevent.jsx";




// Admin pages
import AdminLayout from "./Admin/component/adminlayout.jsx";
import AdminHome from "./Admin/component/adminhome.jsx";
import AdminEvents from "./Admin/component/adminEvents.jsx";
import AdminParticipants from "./Admin/component/adminParticipants.jsx";

import AdminUsers from "./Admin/component/adminUsers.jsx";
import AdminVenues from "./Admin/component/adminVenues.jsx";


import ProtectedRoute from "./logrespage/protectedroute.jsx";
import NotFound from "./logrespage/notfound.jsx";
// import ArtistEventEdit from "./Artist/component/artisteventedit.jsx";
// import ArtistEvents from "./Artist/component/artistevents.jsx";

export default function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Artist routes */}
      <Route
        path="/artist"
        element={
          <ProtectedRoute allowedRole="artist">
            <ArtistLayout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<ArtistHome />} />
        <Route path="events" element={<ArtistEvents />} />
        <Route path="events/new" element={<ArtistEventNew />} />
        <Route path="events/:eventId/edit" element={<ArtistEventEdit />} />
        <Route path="events/:eventId/participants" element={<ArtistEventParticipants />} />
        <Route path="map" element={<ArtistMap />} />
        <Route path="profile" element={<ArtistProfile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>



{/* //fan route */}
<Route
  path="/fan"
  element={
    <ProtectedRoute allowedRole="fan">
      <FanLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<FanDashboard />} />
  <Route path="map" element={<FanMap />} />
  <Route path="events" element={<FanEvents />} />
  <Route path="my-events" element={<MyEvent />} />
  <Route path="profile" element={<FanProfile />} />
</Route>

<Route path="/events/:eventId" element={<FanEventDetail />} />

{/* <Route path="/events/:eventId" element={<FanEventDetail />} /> */}
  

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminHome />} />
        <Route path="venues" element={<AdminVenues />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="participants" element={<AdminParticipants />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}