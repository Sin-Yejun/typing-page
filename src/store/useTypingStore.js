import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import sentencesData from '../sentences.json';
import { isCharCorrect, countKeystrokes } from '../utils/textValidation';

// Helper to calculate accuracy
const calculateAccuracy = (correct, total) => {
  if (total === 0) return 100;
  return Math.max(0, Math.floor((correct / total) * 100));
};

// Helper to calculate WPM/CPM
// CPM: Characters Per Minute
// WPM: CPM / 5
const calculateSpeed = (startTime, endTime, correctChars) => {
  if (!startTime || !endTime) return { wpm: 0, cpm: 0 };
  const durationInMinutes = (endTime - startTime) / 60000;
  if (durationInMinutes <= 0) return { wpm: 0, cpm: 0 };
  
  const cpm = Math.floor(correctChars / durationInMinutes);
  const wpm = Math.floor(cpm / 5);
  return { wpm, cpm };
};

export const useTypingStore = create(
  persist(
    (set, get) => ({
      // Settings
      language: 'ko', // 'ko' | 'en'
      theme: 'system', // 'light' | 'dark' | 'system'
      soundEnabled: true,
      soundConfig: {
        type: 'animalese', // 'mechanical' | 'animalese'
        profile: 'f1', // 'f1', 'm1', etc.
        voiceLanguage: 'korean', // 'korean' | 'english'
        frequency: 600, // Pitch (Hz)
        volume: 0.4,    // Gain (0-1)
      },
      isSettingsOpen: false,

      // Session State
      text: '',
      userInput: '',
      status: 'idle', // 'idle' | 'running' | 'finished'
      startTime: null,
      endTime: null,
      
      // Stats
      errors: 0,
      totalChars: 0,
      correctChars: 0,
      
      // History (Persisted)
      history: [],

      // Actions
      setLanguage: (lang) => {
        set({ language: lang });
        get().resetSession();
      },

      setTheme: (theme) => set({ theme }),
      
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      setSoundConfig: (newConfig) => set((state) => ({ 
        soundConfig: { ...state.soundConfig, ...newConfig } 
      })),

      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

      resetSession: () => {
        const { language } = get();
        const sentences = sentencesData[language] || sentencesData['en'];
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        
        set({
          text: randomSentence,
          userInput: '',
          status: 'idle',
          startTime: null,
          endTime: null,
          errors: 0,
          totalChars: 0,
          correctChars: 0,
        });
      },

      handleInput: (input) => {
        const { text, status, startTime } = get();
        
        // Don't update if finished
        if (status === 'finished') return;

        // Start timer on first input
        if (status === 'idle' && input.length > 0) {
          set({ status: 'running', startTime: Date.now() });
        }

        const currentInputLength = input.length;
        const prevInputLength = get().userInput.length;
        
        // Calculate diff to detect errors/correct chars
        // This is a simplified "last char" check. 
        // For more robust logic, we compare the whole string or handle backspace differently.
        // Here we just update the input state and recalculate correctness derived from it?
        // Actually, simplest is to just store input and derive "correct chars" count on the fly for stats.
        // But we need to track cumulative errors if we want "total errors made even if corrected".
        // For MVP, let's track errors based on final comparison or naive mismatch.
        
        // Let's count errors conservatively: if the char typed at index i doesn't match text[i], it's an error.
        // But if user backspaces, should we
        // Recalculate errors based on current input state (not cumulative)
        let currentErrors = 0;
        for (let i = 0; i < input.length; i++) {
            if (i < text.length) {
                const nextChar = text[i + 1];
                if (!isCharCorrect(text[i], input[i], nextChar)) {
                    currentErrors++;
                }
            } else {
                // Input is longer than text (extra chars are errors)
                currentErrors++;
            }
        }

        set({ 
          userInput: input, 
          errors: currentErrors 
        });

        // Check completion
        if (input.length >= text.length) {
            // Finish regardless of correctness if length reached
            const now = Date.now();
            set({ 
                status: 'finished', 
                endTime: now 
            });
            get().saveResult();
        }
      },

      saveResult: () => {
        const { text, userInput, startTime, endTime, errors, language } = get();
        
        // Calculate speed based on Keystrokes (Jamo for Korean)
        const correctKeystrokes = countKeystrokes(userInput); 
        // Note: strictly we should subtract errors? 
        // If errors are syllable-based, how to subtract from Jamo count?
        // Simpler to just use gross CPM (based on userInput) for "speed" and accuracy separately.
        // Or approximates. Let's use countKeystrokes(userInput) as roughly "what they typed".
        // If they made errors, usually Net WPM penalizes.
        // Let's stick to gross speed for CPM as requested "타자당 CPM".
        
        const { wpm, cpm } = calculateSpeed(startTime, endTime, correctKeystrokes);
        
        // Calculate final accuracy based on total input length (Syllables) vs errors (Syllables)
        // This keeps accuracy definition consistent with "wrong characters".
        const totalInput = userInput.length;
        const accuracy = totalInput > 0 ? Math.floor(((totalInput - errors) / totalInput) * 100) : 100;
        
        const result = {
          id: Date.now(),
          date: new Date().toISOString(),
          language,
          wpm,
          cpm,
          accuracy,
          errors,
          text: text.substring(0, 20) + '...'
        };

        set((state) => ({ 
          history: [result, ...state.history].slice(0, 20) // Keep last 20
        }));
      }
    }),
    {
      name: 'typing-storage',
      partialize: (state) => ({ 
        history: state.history, 
        language: state.language,
        theme: state.theme,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        soundConfig: state.soundConfig
      }),
    }
  )
);
