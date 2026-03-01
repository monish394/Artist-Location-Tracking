// src/Artist/component/ArtistEventParticipants.jsx
import React from "react";
import { useParams } from "react-router-dom";

const ArtistEventParticipants = () => {
  const { eventId } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Event Participants</h1>
      <p>List of participants for event ID: {eventId}</p>
      {/* TODO: Fetch participants from backend */}
    </div>
  );
};

export default ArtistEventParticipants;