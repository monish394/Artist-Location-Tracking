import dotenv from "dotenv"
dotenv.config();
import connectDB from "./config/configureDB.js";
import express from "express"
import userCtrl from "./app/controller/userctrl.js";
import cors from "cors"
const app=express();
app.use(express.json())
import { auth } from "./app/middleware/auth.js";
import adminCtrl from "./app/controller/adminctrl.js";
import artistCtrl from "./app/controller/artistctrl.js";
import fanCtrl from "./app/controller/fanctrl.js";
import eventCtrl from "./app/controller/eventctrl.js";

// import fanCtrl from "./app/controller/fanctrl.js";

app.use(cors())
const PORT=process.env.PORT;

connectDB();



//admin route
app.get(
  "/api/admin/dashboardstats",
  auth,
  adminCtrl.getAdminDashboard
);
app.get(
  "/api/admin/venues",
  auth,
  adminCtrl.getVenues
);

app.post(
  "/api/admin/venues",
  auth,
  adminCtrl.createVenue
);

app.put(
  "/api/admin/venues/:id",
  auth,
  adminCtrl.updateVenue
);
app.get(
  "/api/admin/events",
  auth,
  adminCtrl.getAdminEvents
);
app.get("/users", auth, adminCtrl.getUsers);
app.put("/users/:id", auth, adminCtrl.updateUser);
// PARTICIPANTS
app.get(
  "/participants",
  auth,
//   requireRole("admin"),
  adminCtrl.getParticipants
);



//artist route
app.get("/api/artist/dashboard",auth, artistCtrl.getDashboard);

// EVENTS
app.get("/api/artist/events",auth, artistCtrl.getMyEvents);
app.post("/api/artist/events",auth, artistCtrl.createEvent);
app.get("/api/artist/events/:id", auth,artistCtrl.getEventById);
app.put("/api/artist/events/:id",auth, artistCtrl.updateEvent);
app.delete("/api/artist/events/:id",auth, artistCtrl.deleteEvent);
app.put("/api/artist/profile", auth, artistCtrl.updateProfile);

// EVENT PARTICIPANTS
app.get("/api/artist/events/:id/participants", artistCtrl.getEventParticipants);




app.post('/api/users/register', userCtrl.register);

// POST /api/users/login
app.post('/api/users/login', userCtrl.login);
app.get("/api/users/profile", auth, userCtrl.profile);


//fan route// Dashboardapp.get("/api/fan/dashboard", auth, fanCtrl.dashboard);
// Dashboard
app.get(
  "/api/fan/dashboard",
  auth,
  fanCtrl.dashboard
);

// My Joined Events
app.get(
  "/api/fan/my-events",
  auth,
  fanCtrl.getMyEvents
);

// Profile
app.get(
  "/api/fan/profile",
  auth,
  fanCtrl.getProfile
);

app.put(
  "/api/fan/profile",
  auth,
  fanCtrl.updateProfile
);
app.post(
  "/api/fan/profile-image",
  auth,
  fanCtrl.uploadProfileImage
);
// app.put("/profile", auth,fanCtrl.profile);




//event route 
// ✅ PUBLIC EVENT ROUTES (FOR FANS)
app.get("/api/events", eventCtrl.getAllEvents);
app.get("/api/events/:eventId", eventCtrl.getEventById);
app.post(
  "/api/events/:eventId/join",
  auth,
  eventCtrl.joinEvent
);


app.listen(PORT,()=>{
    console.log("Your port is running on "+ PORT)
})