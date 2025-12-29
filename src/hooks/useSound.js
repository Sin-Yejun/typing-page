import { useRef, useEffect, useState } from "react";
import {
  voice_sprite,
  sfx_sprite,
  keyMapping,
  voiceProfiles,
} from "../utils/animaleseData";
import { customSounds } from "../utils/customSoundData";

export const useSound = (
  enabled = true,
  config = { type: "mechanical", profile: "f1", frequency: 600, volume: 0.4 }
) => {
  const audioContextRef = useRef(null);
  const buffersRef = useRef({}); // Cache for voice buffers
  const sfxBufferRef = useRef(null); // Cache for SFX buffer
  const [loadedProfiles, setLoadedProfiles] = useState(new Set());

  useEffect(() => {
    // Initialize AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext && !audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  // Load SFX (Once)
  useEffect(() => {
    if (!audioContextRef.current) return;
    if (sfxBufferRef.current) return;

    fetch("/sfx.ogg")
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContextRef.current.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        sfxBufferRef.current = audioBuffer;
      })
      .catch((e) => console.error("Failed to load sfx.ogg:", e));
  }, []);

  // Load the selected profile's audio
  useEffect(() => {
    if (!audioContextRef.current) return;

    if (config.type === "animalese") {
      const profileId = config.profile || "f1";
      const language = config.voiceLanguage || "korean";

      const cacheKey = `animalese/${language}/${profileId}`;
      const profile = voiceProfiles[profileId];

      if (profile && !buffersRef.current[cacheKey]) {
        const path = `/voice/${language}/${profileId}.ogg`;

        fetch(path)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) =>
            audioContextRef.current.decodeAudioData(arrayBuffer)
          )
          .then((audioBuffer) => {
            buffersRef.current[cacheKey] = audioBuffer;
            setLoadedProfiles((prev) => new Set(prev).add(cacheKey));
          })
          .catch((e) => console.error(`Failed to load sound ${path}:`, e));
      }
    } else if (config.type === "custom") {
      const soundKey = config.profile || "keyboard-press";
      const soundData = customSounds[soundKey];
      const cacheKey = `custom/${soundKey}`;

      if (soundData && !buffersRef.current[cacheKey]) {
        fetch(soundData.path)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) =>
            audioContextRef.current.decodeAudioData(arrayBuffer)
          )
          .then((audioBuffer) => {
            buffersRef.current[cacheKey] = audioBuffer;
            setLoadedProfiles((prev) => new Set(prev).add(cacheKey));
          })
          .catch((e) =>
            console.error(`Failed to load custom sound ${soundData.path}:`, e)
          );
      }
    }
  }, [config.type, config.profile, config.voiceLanguage]);

  const playClick = (char = "") => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;

    // Resume context if suspended
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const volume = config.volume !== undefined ? config.volume : 0.4;

    if (config.type === "animalese") {
      if (char === " " && keyMapping[" "] !== "default") return; // Skip space if no mapping or if unwanted. Wait, previous code skipped space.

      const profileId = config.profile || "f1";
      const language = config.voiceLanguage || "korean";
      const cacheKey = `animalese/${language}/${profileId}`;
      
      const profile = voiceProfiles[profileId];
      // Note: we don't strictly need profile loaded to play SFX, but we do for voice.
      
      const normalizedChar = char.toLowerCase();
      let spriteKey = keyMapping[normalizedChar] || keyMapping[char] || "o";

      // Fallback for unknown characters
      if (!keyMapping[normalizedChar] && !keyMapping[char]) {
          // If it looks like a symbol/number not in map, maybe random letter?
          // Existing logic:
          const keys = "abcdefghijklmnopqrstuvwxyz";
          const code = char.charCodeAt(0) || 0;
          spriteKey = keys[code % keys.length];
      }

      // Check if it's Voice or SFX
      let isSfx = false;
      let spriteData = voice_sprite[spriteKey];
      
      if (!spriteData) {
        spriteData = sfx_sprite[spriteKey];
        isSfx = true;
      }
      
      // Select buffer
      const buffer = isSfx ? sfxBufferRef.current : buffersRef.current[cacheKey];

      if (buffer && spriteData) {
        let startTime = spriteData[0] / 1000;
        let duration = spriteData[1] / 1000;

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // Pitch shift logic
        let rate = 1.0;
        if (isSfx) {
             // For SFX, we might want consistent pitch, or very slight variation.
             // Applying voice profile pitch to SFX usually sounds wrong (e.g. low pitch click).
             // However, slight variation makes it organic.
             const variation = (Math.random() * 0.1 - 0.05);
             rate = 1.0 + variation;
        } else {
             // Voice
             if (profile) {
                const basePitch = profile.pitch;
                const variation = (Math.random() * 2 - 1) * profile.variation;
                const totalPitchShift = basePitch + variation;
                rate = Math.pow(2, totalPitchShift / 12.0);
             }
        }

        source.playbackRate.value = Math.max(0.1, rate);

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start(0, startTime, duration);
      }
    } else if (config.type === "custom") {
      const soundKey = config.profile || "keyboard-press";
      const soundData = customSounds[soundKey];
      const cacheKey = `custom/${soundKey}`;
      const buffer = buffersRef.current[cacheKey];

      if (buffer && soundData) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // Randomize pitch slightly (±5%)
        const variation = Math.random() * 0.1 - 0.05;
        source.playbackRate.value = 1.0 + variation;

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Use config override if present, else fallback to metadata
        const startTime =
          config.customOffset !== undefined
            ? config.customOffset
            : soundData.startTime || 0;
        const duration =
          config.customDuration !== undefined
            ? config.customDuration
            : soundData.duration;

        if (duration) {
          source.start(0, startTime, duration);
        } else {
          source.start(0, startTime);
        }
      }
    } else {
      // --- Mechanical Logic (Synthesis) ---
      const bufferSize = ctx.sampleRate * 0.05; // 50ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = config.frequency || 600;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    }
  };

  const playError = () => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    const gain = ctx.createGain();
    const volume = config.volume !== undefined ? config.volume : 0.4;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  return { playClick, playError };
};
