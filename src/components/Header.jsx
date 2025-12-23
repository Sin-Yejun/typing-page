import React from "react";
import { Moon, Sun, RotateCcw, Sliders } from "lucide-react";
import { useTypingStore } from "../store/useTypingStore";
import "./Header.css";

const Header = () => {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    resetSession,
    toggleSettings,
  } = useTypingStore();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  React.useEffect(() => {
    // Initialize theme on mount
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Handle language change with confirmation if in progress?
  // For now just switch.
  const handleLanguageChange = (lang) => {
    if (lang !== language) {
      setLanguage(lang);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>TypeZen</h1>
      </div>

      <div className="controls">
        <div className="language-selector">
          <button
            className={`lang-btn ${language === "ko" ? "active" : ""}`}
            onClick={() => handleLanguageChange("ko")}
          >
            Korean
          </button>
          <button
            className={`lang-btn ${language === "en" ? "active" : ""}`}
            onClick={() => handleLanguageChange("en")}
          >
            English
          </button>
        </div>

        <button className="icon-btn" onClick={resetSession} title="Restart">
          <RotateCcw size={20} />
        </button>

        <button
          className="icon-btn"
          onClick={toggleSettings}
          title="Sound Settings"
        >
          <Sliders size={20} />
        </button>

        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
