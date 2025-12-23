import React from "react";
import { RotateCcw } from "lucide-react";
import { useTypingStore } from "../store/useTypingStore";
import "./ResultsModal.css";

const ResultsModal = () => {
  const { status, history, resetSession } = useTypingStore();

  if (status !== "finished") return null;

  const lastResult = history[0]; // The most recent result
  if (!lastResult) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Result</h2>

        <div className="result-grid">
          <div className="result-item">
            <span className="label">WPM</span>
            <span className="value big wpm">{lastResult.wpm}</span>
            <span className="sub">Words/min</span>
          </div>
          <div className="result-item">
            {/* CPM (KPM for Korean mostly) */}
            <span className="label">CPM</span>
            <span className="value big cpm">{lastResult.cpm}</span>
            <span className="sub">Chars/min</span>
          </div>
          <div className="result-item">
            <span className="label">Accuracy</span>
            <span className="value">{lastResult.accuracy}%</span>
          </div>
          <div className="result-item">
            <span className="label">Errors</span>
            <span className="value error">{lastResult.errors}</span>
          </div>
        </div>

        <button className="restart-btn" onClick={resetSession} autoFocus>
          <RotateCcw size={18} />
          <span>Play Again</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsModal;
