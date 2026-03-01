1. Shared Pages (All Roles)
Landing / Home

URL: /
Used by: Everyone
Purpose: Briefly explain the platform (Artist Performance Location Tracker) and give entry points.
Main actions: Links/buttons to Login, Register, and maybe “Explore as Fan/Artist”.
Register

URL: /register
Used by: Artist, Fan
Purpose: Create an account and choose role.
Main actions:
Enter email + password.
Choose role: artist or fan.
(Optionally) basic profile fields (name, city, artist name, etc.).
Login

URL: /login
Used by: Admin, Artist, Fan
Purpose: Authenticate and get into the system.
Main actions:
Enter email + password.
After success, redirect by role:
Admin → /admin/dashboard
Artist → /artist/dashboard
Fan → /fan/dashboard (or /fan/map)



<!-- ------------------------------------------------------------------------------------------------------------------ -->


2. Admin Pages
Admin manages venues, oversees events, and can manage users/participants.

Admin Dashboard

URL: /admin/dashboard
Purpose: Overview of the whole platform.
Main actions:
See counts: users, artists, fans, venues, events, participants.
See recent events created.
Quick navigation to venue, event, and user management pages.
Venue Management

URL: /admin/venues
Purpose: Only place where venues are created/edited (fulfills your requirement).
Main actions:
List all venues (name, address, city, state, coordinates).
Create new venue (admin inputs address; backend handles geolocation).
Edit venue details.
Deactivate/delete venues so they can no longer be used by artists.
Event Management (Global)

URL: /admin/events
Purpose: See and monitor all events from all artists.
Main actions:
List events with artist, venue, date/time.
Filter by date, artist, or venue.
Spot problematic or duplicate events.
Optionally edit or remove events that break rules.
User Management

URL: /admin/users
Purpose: Manage all user accounts (artists, fans, other admins).
Main actions:
List users and filter by role.
View basic profile (email, role, status).
Activate/deactivate accounts.
Optionally promote/demote roles if needed.
Participant / Attendance Overview (optional)

URL: /admin/participants
Purpose: Global overview of which events fans are joining.
Main actions:
See which events have the most participants.
Basic attendance statistics.



<!-- ------------------------------------------------------------------------------------------------------------------------------------- -->



3. Artist Pages
Artist creates and manages events, but must select venues created by Admin.

Artist Dashboard

URL: /artist/dashboard
Purpose: Main page for the logged‑in artist.
Main actions:
View upcoming and past events.
See quick stats (e.g., events this month).
Buttons/links to “Create New Event” and “Manage Events”.
My Events (Artist Event List)

URL: /artist/events
Purpose: See and manage all events belonging to this artist.
Main actions:
List events (title, venue, date/time).
Click to edit or delete/cancel an event.
Button “Create New Event” which goes to event form.
Create Event

URL: /artist/events/new
Purpose: Let the artist create a new event.
Main actions:
Enter event title.
Select Venue from a dropdown/autocomplete of admin‑managed venues.
Set date & time.
Add description / notes.
Save to create an Event linked to:
current Artist
chosen Venue.
Edit Event

URL: /artist/events/:eventId/edit
Purpose: Modify details of an existing event.
Main actions:
Change title, selected venue (still from admin’s venues), date/time, description.
Save updated event.
Event Participants (who is coming) (optional but matches Participant model)

URL: /artist/events/:eventId/participants
Purpose: See which fans are attending a specific event.
Main actions:
List fans (participants) for this event.
See count of attendees.
Artist Map View (optional, but good for “location tracker”)

URL: /artist/map
Purpose: Show this artist’s events on a map.
Main actions:
See markers at venues where they perform.
Click marker to see event info (date, time).
Artist Profile & Settings (optional)

URL: /artist/profile
Purpose: Manage own profile.
Main actions:
Edit artist name/stage name, bio, base city.
Change password / basic account settings.


<!-- --------------------------------------------------------------------------------------------------------------------------------------------- -->

4. Fan Pages
Fan discovers events, views them on a map/list, and becomes a participant by joining events.

Fan Dashboard / Explore Map

URL: /fan/dashboard or /fan/map
Purpose: Main exploration page for fans.
Main actions:
See interactive map with event markers (using venue coordinates).
Filter events by city, date range, or artist.
Click a marker or list item to open event detail.
Event List / Browse Events

URL: /fan/events
Purpose: Show be‑all list/calendar of upcoming events.
Main actions:
List events with date, time, venue, artist.
Filter and sort (by date, city, etc.).
Click event to go to event detail page.
Event Detail (Fan view)

URL: /events/:eventId
Purpose: Full details about a single event.
Main actions:
See artist, venue name & address (and mini map), date/time, description, links.
Join/Attend event → create Participant record linking this fan to this event.
Leave/Cancel attendance → remove Participant.
Optionally “Save to favorites”.
My Events / My Participation

URL: /fan/my-events or /fan/participation
Purpose: Show which events this fan is attending.
Main actions:
View upcoming joined events (from Participant model).
Optional: view past events attended.
Click to open event detail; cancel participation if needed.
Fan Profile & Preferences (optional)

URL: /fan/profile
Purpose: Let the fan manage their basic info and preferences.
Main actions:
Edit name and home city (for centering the map).
Choose favorite genres/artists.
Change password / account settings.



-------------------------------------------------------------------------



Model	Created By	Purpose	Key Fields
User	System	Authentication & Login	email, password, role
Artist	Artist registers	Artist profile details	artistName, bio, genre, socialMedia
Fan	Fan registers	Fan profile details	firstName, lastName, favoriteGenres
Venue	Admin adds	Performance locations	name, address, coordinates, capacity
Event	Artist creates	Performance details	title, dateTime, venue, ticketInfo
Participant	Fan registers	Event attendance	fan, event, ticketNumber, status




------------------------------------------------------------------------

┌─────────────────────────────────────────┐
│         REGISTRATION FORM               │
│                                         │
│  Role: [  Select Role ▼  ]              │
│         ├── Fan                         │
│         └── Artist                      │
│                                         │
│  Email: [______________]  ──────────┐   │
│  Password: [___________]  ──────────┤   │
│                                     │   │
│  ┌─── If Fan Selected ──┐          │   │
│  │ First Name: [_______] │          │   │
│  │ Last Name: [________] │          │   │
│  │ City: [_____________] │          │   │
│  └───────────────────────┘          │   │
│                                     │   │
│  ┌─── If Artist Selected ─┐        │   │
│  │ Artist Name: [________] │        │   │
│  │ Genre: [______________] │        │   │
│  │ Bio: [________________] │        │   │
│  │ Instagram: [__________] │        │   │
│  └──────────────────────── ┘        │   │
│                                     │   │
│  [  Register  ]                     │   │
└──────────┬──────────────────────────┘   │
           │                              │
           ▼                              │
    Backend receives                      │
    ALL form data                         │
           │                              │
           ▼                              │
    ┌──────────────┐                      │
    │ req.body =   │                      │
    │ {            │                      │
    │   email,     │◄─────────────────────┘
    │   password,  │
    │   role,      │
    │   ...rest    │
    │ }            │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────┐
    │ Backend splits data  │
    │ based on ROLE        │
    └──────┬───────────────┘
           │
     ┌─────┴──────┐
     │            │
     ▼            ▼
role=fan     role=artist
     │            │
     ▼            ▼
┌─────────┐  ┌──────────┐
│  USER   │  │   USER   │
│Collection│  │Collection│
│{email,  │  │{email,   │
│password,│  │password, │
│role:fan}│  │role:     │
│         │  │artist}   │
└────┬────┘  └────┬─────┘
     │            │
     ▼            ▼
┌─────────┐  ┌──────────┐
│   FAN   │  │  ARTIST  │
│Collection│  │Collection│
│{first,  │  │{artist   │
│last,    │  │Name,bio, │
│city}    │  │genre}    │
└─────────┘  └──────────┘