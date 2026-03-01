// src/Artist/component/ArtistEventEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ArtistEventEdit = () => {
  const { eventId } = useParams();
  const [form, setForm] = useState({
    title: "",
    venueId: "",
    date: "",
    time: "",
    description: "",
  });

  useEffect(() => {
    // TODO: fetch existing event by eventId and populate form
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Update event:", form);
    // TODO: Send PUT request to backend
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        {/* Other fields similar to ArtistEventNew */}
        <button type="submit" className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Update Event</button>
      </form>
    </div>
  );
};

export default ArtistEventEdit;