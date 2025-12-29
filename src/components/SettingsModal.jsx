import React from "react";
import { X, Keyboard, Hand, Sparkles, Sprout } from "lucide-react";
import { useTypingStore } from "../store/useTypingStore";
import { voiceProfiles } from "../utils/animaleseData";
import { customSounds } from "../utils/customSoundData";
import "./SettingsModal.css";

const SettingsModal = () => {
  const {
    isSettingsOpen,
    toggleSettings,
    soundConfig,
    setSoundConfig,
    language,
  } = useTypingStore();

  if (!isSettingsOpen) return null;

  const langKey = language === "ko" ? "ko" : "en";

  const translations = {
    ko: {
      title: "소리 설정",
      effect: "효과음 선택",
      animalese: "동물의 숲",
      voice: "목소리 성격",
      hint: "언어(한국어/영어)에 따라 목소리가 자동으로 변경됩니다.",
      volume: "음량",
    },
    en: {
      title: "Sound Settings",
      effect: "Sound Effect",
      animalese: "Animal Crossing",
      voice: "Voice Personality",
      hint: "Voice automatically matches page language (Korean/English).",
      volume: "Volume",
    },
  };

  const t = translations[langKey];

  const handleVolumeChange = (e) => {
    setSoundConfig({ volume: parseFloat(e.target.value) });
  };

  const handleMainSoundChange = (value) => {
    if (value === "animalese") {
      // Keep existing profile if switching back to animalese, or default to f1 if none
      const currentProfile = voiceProfiles[soundConfig.profile]
        ? soundConfig.profile
        : "f1";
      setSoundConfig({ type: "animalese", profile: currentProfile });
    } else {
      // It's a custom sound
      const data = customSounds[value];
      setSoundConfig({
        type: "custom",
        profile: value,
        // Reset overrides when switching to a fresh preset
        customOffset: data.startTime || 0,
        customDuration: data.duration || null,
      });
    }
  };

  // Determine current selection for the main dropdown
  const currentSelection =
    soundConfig.type === "animalese" ? "animalese" : soundConfig.profile;

  // Close when clicking outside content
  const handleOverlayClick = (e) => {
    if (e.target.className === "settings-modal-overlay") {
      toggleSettings();
    }
  };

  // Icon Mapping
  const getIcon = (key) => {
    switch (key) {
      case "keyboard-press":
        return <Keyboard size={24} />;
      case "knock-on-wood":
        return <Hand size={24} />;
      case "pop":
        return <Sparkles size={24} />;
      case "animalese":
        return <Sprout size={24} />; // Leaf might not be available in all versions, Sprout is safe/cute
      default:
        return null;
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal-content">
        <div className="settings-header">
          <h2>{t.title}</h2>
          <button className="close-btn" onClick={toggleSettings}>
            <X size={24} />
          </button>
        </div>

        <div className="setting-group">
          <label>{t.effect}</label>
          <div className="sound-grid">
            {/* Custom Sounds */}
            {Object.entries(customSounds).map(([key, data]) => (
              <button
                key={key}
                className={`sound-btn ${
                  currentSelection === key ? "active" : ""
                }`}
                onClick={() => handleMainSoundChange(key)}
              >
                {getIcon(key)}
                <span>{data.name[langKey]}</span>
              </button>
            ))}
            {/* Animalese Option */}
            <button
              className={`sound-btn ${
                currentSelection === "animalese" ? "active" : ""
              }`}
              onClick={() => handleMainSoundChange("animalese")}
            >
              {getIcon("animalese")}
              <span>{t.animalese}</span>
            </button>
          </div>
        </div>

        {/* Show Sub-options for Animalese if selected */}
        {soundConfig.type === "animalese" && (
          <div className="setting-group animalese-options">
            <label>{t.voice}</label>
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
            <div className="info-text-small">{t.hint}</div>
          </div>
        )}

        {/* Global Volume Control */}
        <div className="setting-group">
          <label>
            <span>{t.volume}</span>
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
