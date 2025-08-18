"use client";
import { useCallback, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const variants = {
        1: "default",
        2: "secondary",
        3: "outline",
      } as const;
      return (
        <Badge variant={variants[rank as keyof typeof variants]}>{rank}</Badge>
      );
    }
    return <span className="text-muted-foreground font-medium">{rank}</span>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">Company Leaderboard</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Rankings
          </CardTitle>
          <Button
            onClick={fetchScoreboard}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading scoreboard...</span>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-3">
                <span>Error: {error}</span>
                <Button
                  onClick={fetchScoreboard}
                  variant="outline"
                  size="sm"
                  className="w-fit"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedScores.length > 0 ? (
                    sortedScores.map((employee, index) => {
                      const rank = index + 1;
                      return (
                        <TableRow
                          key={employee.name}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getRankIcon(rank)}
                              {getRankBadge(rank)}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {employee.name}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {employee.score.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No scores to display yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreboardPage;
