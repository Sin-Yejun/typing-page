import React from "react";
import { useTypingStore } from "../store/useTypingStore";
import { countKeystrokes } from "../utils/textValidation";
import "./StatsDisplay.css";

const StatsDisplay = () => {
  const { startTime, endTime, userInput, errors, status } = useTypingStore();

  const [stats, setStats] = React.useState({ wpm: 0, cpm: 0, accuracy: 100 });

  React.useEffect(() => {
    const updateStats = () => {
      if (status !== "running" || !startTime) return;

      const now = Date.now();
      const durationInMinutes = (now - startTime) / 60000;

      const currentKeystrokes = countKeystrokes(userInput);

      const cpm =
        durationInMinutes > 0
          ? Math.floor(currentKeystrokes / durationInMinutes)
          : 0;
      const wpm = Math.floor(cpm / 5);

      const total = userInput.length;
      const accuracy =
        total > 0 ? Math.floor(((total - errors) / total) * 100) : 100;

      setStats({ wpm, cpm, accuracy });
    };

    if (status === "running") {
      // Update immediately on render (caused by input change)
      updateStats();

      // And also periodically to update time-based stats even if idle
      const interval = setInterval(updateStats, 100);
      return () => clearInterval(interval);
    } else if (status === "idle") {
      setStats({ wpm: 0, cpm: 0, accuracy: 100 });
    }
  }, [status, startTime, userInput, errors]); // Added userInput and errors to dependencies

  return (
    <div className="stats-display">
      <div className="stat-item">
        <span className="stat-label">WPM</span>
        <span className="stat-value">{stats.wpm}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">CPM</span>
        <span className="stat-value">{stats.cpm}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Accuracy</span>
        <span className="stat-value">{stats.accuracy}%</span>
      </div>
    </div>
  );
};

export default StatsDisplay;
