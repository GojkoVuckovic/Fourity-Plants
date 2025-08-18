"use client";
import { useCallback, useState, useEffect } from "react";

interface ScoreboardData {
  [employee_name: string]: number;
}

interface EmployeeScore {
  name: string;
  score: number;
}

const ScoreboardPage: React.FC = () => {
  const [scoreboardData, setScoreboardData] = useState<ScoreboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScoreboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/bff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: {
            command: "getScoreboard",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      let outerData;
      try {
        outerData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON: ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`,
        );
      }

      // Updated validation to match actual API response format
      if (!outerData || !outerData.data || typeof outerData.data !== "object") {
        throw new Error(
          "Invalid data structure received from API. Expected format: { data: { [employee_name: string]: number } }",
        );
      }

      setScoreboardData(outerData.data);
    } catch (error) {
      console.error("Failed to fetch scoreboard:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch scoreboard",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScoreboard();
  }, [fetchScoreboard]);

  const employeeScores: EmployeeScore[] = Object.keys(scoreboardData).map(
    (name) => ({
      name: name,
      score: scoreboardData[name],
    }),
  );

  const sortedScores = [...employeeScores].sort((a, b) => b.score - a.score);

  return (
    <div className={`min-h-screen text-white p-6 md:p-10`}>
      <main className="container rounded-xl bg-dirty-white text-black mx-auto py-8">
        <h1 className={`text-4xl md:text-5xl font-bold text-center mb-10`}>
          Company Leaderboard
        </h1>

        {loading ? (
          <div className="text-center py-8">Loading scoreboard...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">
            Error: {error}
            <div className="mt-4">
              <button
                onClick={fetchScoreboard}
                className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
            <div className="mt-4 text-sm">
              <p>Received data: {JSON.stringify(scoreboardData)}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-6">
            <table className="min-w-full text-center">
              <thead className="bg-white/20 border-b border-gray-400">
                <tr>
                  <th className="py-3 px-2 md:px-6 text-xs md:text-sm font-medium uppercase tracking-wider text-black">
                    Rank
                  </th>
                  <th className="py-3 px-2 md:px-6 text-xs md:text-sm font-medium uppercase tracking-wider text-black">
                    Employee
                  </th>
                  <th className="py-3 px-2 md:px-6 text-xs md:text-sm font-medium uppercase tracking-wider text-black">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {sortedScores.length > 0 ? (
                  sortedScores.map((employee, index) => (
                    <tr
                      key={employee.name}
                      className="hover:bg-white/10 transition-colors duration-200"
                    >
                      <td className="py-4 px-2 md:px-6 whitespace-nowrap text-sm md:text-base">
                        {index + 1}
                      </td>
                      <td className="py-4 px-2 md:px-6 whitespace-nowrap text-sm md:text-base font-medium">
                        {employee.name}
                      </td>
                      <td className="py-4 px-2 md:px-6 whitespace-nowrap text-sm md:text-base font-bold">
                        {employee.score}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-lg text-white/70">
                      No scores to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScoreboardPage;
