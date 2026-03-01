import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const FanEventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetchEvent();
    checkStatus();
  }, [eventId]);

  const fetchEvent = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/events/${eventId}`
    );
    setEvent(res.data);
  };

  const checkStatus = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `http://localhost:5000/api/events/${eventId}/status`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setJoined(res.data.joined);
  };

  const handleJoin = async () => {
    const token = localStorage.getItem("token");

    await axios.post(
      `http://localhost:5000/api/events/${eventId}/join`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setJoined(true);
  };

  const handleLeave = async () => {
    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/events/${eventId}/leave`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setJoined(false);
  };

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p>{event.description}</p>
      <p>{event.location?.venueName}</p>
      <p>{new Date(event.startDate).toLocaleString()}</p>

      {joined ? (
        <button
          onClick={handleLeave}
          className="bg-red-600 text-white px-4 py-2 rounded mt-4"
        >
          Cancel Attendance
        </button>
      ) : (
        <button
          onClick={handleJoin}
          className="bg-green-600 text-white px-4 py-2 rounded mt-4"
        >
          Join Event
        </button>
      )}
    </div>
  );
};

export default FanEventDetail;