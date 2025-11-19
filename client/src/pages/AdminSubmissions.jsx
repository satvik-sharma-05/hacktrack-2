// client/src/pages/AdminSubmissions.jsx
import { useEffect, useState } from "react";
import { getPendingSubmissions, approveEventApi } from "../services/organizerApi";

export default function AdminSubmissions() {
  const [items, setItems] = useState([]);
  useEffect(() => { fetch(); }, []);
  async function fetch() {
    const res = await getPendingSubmissions();
    setItems(res.events || []);
  }
  async function handleAction(id, action) {
    if (!confirm(`${action} this event?`)) return;
    await approveEventApi(id, action);
    fetch();
  }
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Submissions</h1>
      {items.map(it => (
        <div key={it._id} className="p-4 mb-2 border rounded">
          <h3>{it.title} — <small className="text-gray-500">{it.createdBy?.name}</small></h3>
          <p className="text-sm">{it.description}</p>
          <div className="mt-2">
            <button onClick={() => handleAction(it._id, "approve")} className="mr-2 px-3 py-1 bg-green-600 text-white rounded">Approve</button>
            <button onClick={() => handleAction(it._1d, "reject")} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
          </div>
        </div>
      ))}
      {!items.length && <p>No pending events</p>}
    </div>
  );
}
