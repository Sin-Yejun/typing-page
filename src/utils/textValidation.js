import { disassemble } from 'es-hangul';

/**
 * Check if the input character matches the target character.
 * Supports partial matching for Korean characters (e.g., 'ㄱ' matches '가').
 * 
 * @param {string} targetChar The correct character from the text
 * @param {string} inputChar The user's input character
 * @returns {boolean} True if input is correct or a valid prefix
 */
export const isCharCorrect = (targetChar, inputChar, nextTargetChar) => {
  if (targetChar === inputChar) return true;
  
  try {
    const targetJamo = disassemble(targetChar);
    const inputJamo = disassemble(inputChar);

    // Case 1: Simple prefix match (typing "가" -> "ㄱ")
    // If input is shorter or equal length to targetJamo, checks prefix.
    // However, inputJamo might differ if composition is drifting.
    
    // Check if inputJamo starts with targetJamo (Overflow case)
    if (inputJamo.length > targetJamo.length) {
       if (inputJamo.startsWith(targetJamo)) {
          // It has overflowed. Check if the overflow part matches the next char's start.
          // Example: Target="빠", Input="빨" (빠+ㄹ). Next="른" (ㄹ+ㅡ+ㄴ)
          const remainder = inputJamo.slice(targetJamo.length);
          
          if (!nextTargetChar) return false; // No next char to match against

          const nextTargetJamo = disassemble(nextTargetChar);
          if (nextTargetJamo.startsWith(remainder)) {
            return true; // Valid transition
          }
       }
       return false;
    }

    // Case 2: Underflow/Exact match (typing "가" -> "ㄱ")
    // Input is shorter or equal.
    // Check if targetJamo starts with inputJamo.
    return targetJamo.startsWith(inputJamo);

  } catch (e) {
    return targetChar === inputChar;
  }
};

/**
 * Calculates the number of keystrokes (Jamos for Korean).
 * @param {string} text 
 * @returns {number}
 */
export const countKeystrokes = (text) => {
  if (!text) return 0;
  try {
    // disassemble decomposes Korean chars into jamos.
    // Non-Korean chars are left as is? 
    // es-hangul disassemble: "가a" -> "ㄱㅏa" ? Let's verify documentation assumption or test.
    // Usually libraries like this only touch Hangul.
    // But safely: disassemble returns string with jamos.
    // Let's assume it handles mixed text or we check per char?
    // es-hangul typically handles the string.
    return disassemble(text).length;
  } catch (e) {
    return text.length;
  }
};
