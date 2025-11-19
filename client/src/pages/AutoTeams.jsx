import { useEffect, useState } from "react";
import { getAutoTeams } from "../services/api";

export default function AutoTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await getAutoTeams();
        setTeams(data);
      } catch {
        alert("You must be logged in to view AI-generated teams.");
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, []);

  if (loading) return <div className="p-6 text-center">Forming AI teams...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">🤖 AI-Generated Teams</h1>

      {teams.length === 0 ? (
        <p className="text-center text-gray-500">No teams formed yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team, index) => (
            <div key={index} className="border rounded p-4 shadow-sm">
              <h2 className="font-semibold mb-2">Team #{index + 1}</h2>
              <p className="text-xs text-gray-500 mb-3">Team Score: {team.teamScore}</p>
              {team.members.map((m, i) => (
                <div key={i} className="mb-2 border p-2 rounded bg-gray-50">
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-gray-600">
                    Roles: {m.roles.join(", ")} <br />
                    Skills: {m.skills.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
