import { useRef, useEffect, useState } from 'react';
import { voice_sprite, keyMapping, voiceProfiles } from '../utils/animaleseData';

export const useSound = (enabled = true, config = { type: 'mechanical', profile: 'f1', frequency: 600, volume: 0.4 }) => {
  const audioContextRef = useRef(null);
  const buffersRef = useRef({}); // Cache for audio buffers
  const [loadedProfiles, setLoadedProfiles] = useState(new Set());

  useEffect(() => {
    // Initialize AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext && !audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  // Load the selected profile's audio
  useEffect(() => {
    if (config.type === 'animalese') {
      const profileId = config.profile || 'f1';
      const language = config.voiceLanguage || 'korean';
      
      // Cache key includes language now
      const cacheKey = `${language}/${profileId}`;
      const profile = voiceProfiles[profileId];
      
      if (profile && !buffersRef.current[cacheKey]) {
        if (!audioContextRef.current) return;

        const path = `/voice/${language}/${profileId}.ogg`;

        fetch(path)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            buffersRef.current[cacheKey] = audioBuffer;
            setLoadedProfiles(prev => new Set(prev).add(cacheKey));
          })
          .catch(e => console.error(`Failed to load sound ${path}:`, e));
      }
    }
  }, [config.type, config.profile, config.voiceLanguage]);

  const playClick = (char = '') => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;

    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const volume = config.volume !== undefined ? config.volume : 0.4;

    if (config.type === 'animalese') {
        if (char === ' ') return;
        
        const profileId = config.profile || 'f1';
        const language = config.voiceLanguage || 'korean';
        const cacheKey = `${language}/${profileId}`;
        const buffer = buffersRef.current[cacheKey];
        const profile = voiceProfiles[profileId];

        if (buffer && profile) {
           let startTime = 0;
           let duration = 0.15;
           
           // Correctly handle Jamo or English char
           const normalizedChar = char.toLowerCase();
           let spriteKey = keyMapping[normalizedChar] || keyMapping[char] || 'o'; // Default to something if not found
           
           // Fallback hashing for symbols not in map
           if (!keyMapping[normalizedChar] && !keyMapping[char]) {
               const keys = "abcdefghijklmnopqrstuvwxyz";
               const code = char.charCodeAt(0) || 0;
               spriteKey = keys[code % keys.length];
           }

           const spriteData = voice_sprite[spriteKey];
           if (spriteData) {
               startTime = spriteData[0] / 1000;
               // spriteData[1] is ms duration. Clip to 150ms for snappiness.
               duration = 0.15; 
           }

           const source = ctx.createBufferSource();
           source.buffer = buffer;
           
           // Pitch Logic: 
           // Rate = 2 ^ ( (pitch_shift + variation) / 12 )
           // Profile pitch is in semitones (e.g. 1.5, -0.5)
           const basePitch = profile.pitch;
           const variation = (Math.random() * 2 - 1) * profile.variation; // +/- variation
           
           const totalPitchShift = basePitch + variation;
           const rate = Math.pow(2, totalPitchShift / 12.0);
           
           source.playbackRate.value = Math.max(0.1, rate);

           const gainNode = ctx.createGain();
           gainNode.gain.value = volume;

           source.connect(gainNode);
           gainNode.connect(ctx.destination);

           source.start(0, startTime, duration);
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
        filter.type = 'lowpass'; 
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
    osc.type = 'triangle';
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
  }

  return { playClick, playError };
};
