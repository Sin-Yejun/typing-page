import React from "react";
import Header from "./components/Header";
import TypingArea from "./components/TypingArea";
import StatsDisplay from "./components/StatsDisplay";
import ResultsModal from "./components/ResultsModal";
import SettingsModal from "./components/SettingsModal";
import { useTypingStore } from "./store/useTypingStore";
import "./App.css";

function App() {
  const { status, resetSession } = useTypingStore();

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to reset/restart anytime
      if (e.key === "Escape") {
        resetSession();
      }
      // Enter to restart only when finished
      if (e.key === "Enter" && status === "finished") {
        resetSession();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, resetSession]);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <StatsDisplay />
        <TypingArea />
      </main>
      <ResultsModal />
      <SettingsModal />
      <footer className="footer">
        <p>
          Press <code>Esc</code> to reset
        </p>
      </footer>
    </div>
  );
}

export default App;
