import React, { useEffect, useRef, useState } from "react";
import { useTypingStore } from "../store/useTypingStore";
import { isCharCorrect, countKeystrokes } from "../utils/textValidation";
import { useSound } from "../hooks/useSound";
import "./TypingArea.css";

const TypingArea = () => {
  const {
    text,
    userInput,
    handleInput,
    status,
    resetSession,
    errors,
    soundEnabled,
    soundConfig,
  } = useTypingStore();
  const { playClick, playError } = useSound(soundEnabled, soundConfig);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Initialize session on mount if empty
    if (!text) resetSession();
  }, [text, resetSession]);

  useEffect(() => {
    // Focus input on mount and when status resets
    if (status === "idle" || status === "running") {
      inputRef.current?.focus();
    }
  }, [status]);

  const handleChange = (e) => {
    const newVal = e.target.value;

    // Play sound if Jamo count increased (detects Korean composition steps)
    const prevKeystrokes = countKeystrokes(userInput);
    const newKeystrokes = countKeystrokes(newVal);

    if (newKeystrokes > prevKeystrokes) {
      playClick();
    }
    handleInput(newVal);
  };

  const handleClick = () => {
    inputRef.current?.focus();
  };

  // Render individual characters with styling
  const renderCharacters = () => {
    return text.split("").map((char, index) => {
      let className = "char";
      const isTyped = index < userInput.length;
      const inputChar = userInput[index];

      const nextChar = text[index + 1];

      if (isTyped) {
        if (isCharCorrect(char, inputChar, nextChar)) {
          className += " correct";
        } else {
          className += " incorrect";
        }
      }

      // Cursor logic
      if (index === userInput.length) {
        className += " cursor";
      }

      return (
        <span key={index} className={className}>
          {isTyped ? inputChar : char}
        </span>
      );
    });
  };

  return (
    <div
      className={`typing-area-container ${isFocused ? "focused" : ""}`}
      onClick={handleClick}
      ref={containerRef}
    >
      <div className="text-display">
        {renderCharacters()}
        {/* Render extra cursor if at the end */}
        {userInput.length === text.length && (
          <span className="char cursor space">&nbsp;</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        className="hidden-input"
        value={userInput}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />
    </div>
  );
};

export default TypingArea;
