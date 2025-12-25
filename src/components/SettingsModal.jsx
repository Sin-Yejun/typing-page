import React from "react";
import { X } from "lucide-react";
import { useTypingStore } from "../store/useTypingStore";
import { voiceProfiles } from "../utils/animaleseData";
import { customSounds } from "../utils/customSoundData";
import "./SettingsModal.css";

const SettingsModal = () => {
  const { isSettingsOpen, toggleSettings, soundConfig, setSoundConfig } =
    useTypingStore();

  if (!isSettingsOpen) return null;

  const handleVolumeChange = (e) => {
    setSoundConfig({ volume: parseFloat(e.target.value) });
  };

  const handleMainSoundChange = (e) => {
    const value = e.target.value;
    if (value === "animalese") {
      // Keep existing profile if switching back to animalese, or default to f1 if none
      const currentProfile = voiceProfiles[soundConfig.profile] ? soundConfig.profile : 'f1';
      setSoundConfig({ type: "animalese", profile: currentProfile });
    } else {
      // It's a custom sound
      const data = customSounds[value];
      setSoundConfig({ 
          type: "custom", 
          profile: value,
          // Reset overrides when switching to a fresh preset
          customOffset: data.startTime || 0,
          customDuration: data.duration || null
      });
    }
  };

  // Determine current selection for the main dropdown
  const currentSelection = soundConfig.type === "animalese" ? "animalese" : soundConfig.profile;

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
          <label>Sound Effect</label>
          <select
            value={currentSelection}
            onChange={handleMainSoundChange}
            className="profile-select"
          >
            {/* 1. Custom Sounds */}
            {Object.entries(customSounds).map(([key, data]) => (
              <option key={key} value={key}>
                {data.name}
              </option>
            ))}
            {/* 2. Animalese (Last) */}
            <option value="animalese">Animalese (Dynamic)</option>
          </select>
        </div>

        {/* Show Sub-options for Animalese if selected */}
        {soundConfig.type === "animalese" && (
          <div className="setting-group" style={{ marginTop: '0.5rem', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
            <label>Voice Personality</label>
            <select
              value={soundConfig.profile || "f1"}
              onChange={(e) => setSoundConfig({ profile: e.target.value })}
              className="profile-select"
            >
              {Object.entries(voiceProfiles).map(([key, profile]) => (
                <option key={key} value={key}>
                  {profile.name}
                </option>
              ))}
            </select>
            <div className="info-text-small">
              Voice automatically matches page language (Korean/English).
            </div>
          </div>
        )}

        {/* Global Volume Control */}
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
      </div>
    </div>
  );
};

export default SettingsModal;
