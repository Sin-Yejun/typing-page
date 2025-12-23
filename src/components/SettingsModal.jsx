import React from "react";
import { X } from "lucide-react";
import { useTypingStore } from "../store/useTypingStore";
import "./SettingsModal.css";

const SettingsModal = () => {
  const { isSettingsOpen, toggleSettings, soundConfig, setSoundConfig } =
    useTypingStore();

  if (!isSettingsOpen) return null;

  const handleFrequencyChange = (e) => {
    setSoundConfig({ frequency: parseInt(e.target.value) });
  };

  const handleVolumeChange = (e) => {
    setSoundConfig({ volume: parseFloat(e.target.value) });
  };

  // Close when clicking outside content
  const handleOverlayClick = (e) => {
    if (e.target.className === "settings-modal-overlay") {
      toggleSettings();
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal-content">
        <div className="settings-header">
          <h2>Sound Settings</h2>
          <button className="close-btn" onClick={toggleSettings}>
            <X size={24} />
          </button>
        </div>

        <div className="setting-group">
          <label>
            <span>Tone (Pitch)</span>
            <span className="value-label">{soundConfig.frequency}Hz</span>
          </label>
          <input
            type="range"
            min="200"
            max="1200"
            step="50"
            value={soundConfig.frequency}
            onChange={handleFrequencyChange}
          />
          <div className="range-labels">
            <span>Low (Thock)</span>
            <span>High (Click)</span>
          </div>
        </div>

        <div className="setting-group">
          <label>
            <span>Volume</span>
            <span className="value-label">
              {Math.round(soundConfig.volume * 100)}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundConfig.volume}
            onChange={handleVolumeChange}
          />
        </div>

        <div className="info-text">
          Adjust the sliders to customize your typing sound.
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
