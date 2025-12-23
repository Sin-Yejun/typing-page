import { useRef, useEffect } from 'react';

export const useSound = (enabled = true, config = { frequency: 600, volume: 0.4 }) => {
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Initialize AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  const playClick = () => {
    if (!enabled || !audioContextRef.current) return;

    // Resume context if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const ctx = audioContextRef.current;

    // Create a short burst of noise for "click" texture
    const bufferSize = ctx.sampleRate * 0.05; // 50ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to make it sound more like a switch
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; 
    filter.frequency.value = config.frequency || 600; // Use config frequency

    // Gain envelope (shorter, punchier)
    const gain = ctx.createGain();
    const volume = config.volume !== undefined ? config.volume : 0.4;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  };

  const playError = () => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  return { playClick, playError };
};
