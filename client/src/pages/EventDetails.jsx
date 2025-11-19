// src/pages/EventDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EventDetails() {
  const { id } = useParams(); // value from route /events/:id
  const { user, fetchMe } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch (err) {
      console.error("Load event error", err);
      setError(err.response?.data?.message || "Could not load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <div className="p-6">Loading event...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!event) return <div className="p-6">Event not found.</div>;

  const isCreator = user && event.createdBy && String(user.id || user._id) === String(event.createdBy._id);
  const isOrganizerEvent = event.source === "organizer" || event.platform === "organizer";

  const handleBookmark = async () => {
    try {
      await API.post(`/events/${event._id || `${event.platform}:${event.externalId}`}/bookmark`);
      // optionally refresh or show UI
      alert("Toggled bookmark");
    } catch (err) {
      console.error(err);
      alert("Bookmark failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Banner */}
      {event.bannerImage && (
        <img src={event.bannerImage} alt="banner" className="w-full h-56 object-cover rounded-lg" />
      )}

      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{event.title}</h1>

          <div className="mt-2 flex items-center gap-3">
            <span className="px-2 py-1 text-xs rounded bg-gray-100">
              {new Date(event.start).toLocaleString()} {event.end ? `→ ${new Date(event.end).toLocaleString()}` : ""}
            </span>

            {isOrganizerEvent && (
              <span className="px-2 py-1 text-xs rounded bg-yellow-100">Organizer</span>
            )}
            {event.source === "clist" && (
              <span className="px-2 py-1 text-xs rounded bg-blue-100">CLIST</span>
            )}

            {event.status && event.status !== "approved" && (
              <span className="px-2 py-1 text-xs rounded bg-orange-100">
                {event.status.toUpperCase()}
              </span>
            )}
          </div>

          <p className="mt-4 text-gray-700 whitespace-pre-line">{event.description || "No description."}</p>

          <div className="mt-4">
            <h4 className="font-semibold">Skills</h4>
            <div className="flex gap-2 flex-wrap mt-2">
              {(event.skills || []).map((s) => (
                <span key={s} className="px-2 py-1 bg-gray-100 rounded">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            {isCreator ? (
              <>
                <Link to={`/organizer/edit/${event._id}`} className="px-4 py-2 bg-indigo-600 text-white rounded">
                  Edit Event
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this event?")) return;
                    try {
                      await API.delete(`/organizer/${event._id}`);
                      alert("Deleted");
                      navigate("/organizer");
                    } catch (err) {
                      console.error(err);
                      alert("Delete failed");
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </>
            ) : (
              <>
                <a
                  href={event.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Register / Participate
                </a>

                <button onClick={handleBookmark} className="px-4 py-2 border rounded">
                  Bookmark
                </button>
              </>
            )}
          </div>
        </div>

        {/* Organizer card */}
        <aside className="w-64">
          <div className="border rounded p-4">
            <h5 className="font-semibold">Organizer</h5>
            {event.createdBy ? (
              <>
                <p className="mt-2">{event.createdBy.name}</p>
                <p className="text-sm text-gray-500">{event.createdBy.email}</p>
                <p className="text-sm text-gray-400 mt-2">Role: {event.createdBy.role}</p>
                <Link to={`/profile/${event.createdBy._id}`} className="text-sm text-blue-600 mt-2 inline-block">
                  View profile
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-500">External organizer</p>
            )}

            <div className="mt-4">
              <p className="text-xs text-gray-500">Source: {event.source || event.platform}</p>
              <p className="text-xs text-gray-500">Status: {event.status || (event.isApproved ? "approved" : "unknown")}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
