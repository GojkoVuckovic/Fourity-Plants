interface ScoreboardData {
  [employee_name: string]: number;
}

interface EmployeeScore {
  name: string;
  score: number;
}

const mockScoreboardData: ScoreboardData = {
  "Alice Smith": 1500,
  "Bob Johnson": 1200,
  "Charlie Brown": 2000,
  "Diana Prince": 1800,
  "Eve Adams": 900,
  "Frank White": 1750,
  "Grace Kelly": 1100,
};

const ScoreboardPage: React.FC = () => {
  // Convert the object data into an array for easier sorting and rendering
  const employeeScores: EmployeeScore[] = Object.keys(mockScoreboardData).map(
    (name) => ({
      name: name,
      score: mockScoreboardData[name],
    }),
  );

  const sortedScores = [...employeeScores].sort((a, b) => b.score - a.score);

  return (
    <div className={`min-h-screen text-white p-6 md:p-10`}>
      <main className="container mx-auto py-8">
        <h1 className={`text-4xl md:text-5xl font-bold text-center mb-10`}>
          Company Leaderboard
        </h1>

        <div className="bg-white/10 rounded-lg shadow-xl overflow-hidden backdrop-blur-sm">
          {" "}
          <div className="p-4 md:p-6">
            <table className="min-w-full text-center">
              <thead className="bg-white/20 border-b border-gray-400">
                <tr>
                  <th className="py-3 px-2 md:px-6 text-xs md:text-sm font-medium uppercase tracking-wider text-gray-50">
                    Rank
                  </th>
                  <th className="py-3 px-2 md:px-6 text-xs md:text-sm font-medium uppercase tracking-wider text-gray-50">
                    Employee
                  </th>
                  <th className="py-3 px-2 md:px-6 text-xs md:text-sm font-medium uppercase tracking-wider text-gray-50">
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
        </div>
      </main>
    </div>
  );
};

export default ScoreboardPage;
