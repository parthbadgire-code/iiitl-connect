import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity';

// Initialize the English profanity matcher
const englishMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// Custom Hindi/Hinglish profanity list
const hindiProfanity = [
  "mc", "bc", "bsdk",
  "bhenchod", "behenchod", "madarchod", "bhosdike", "bhosada", "bhosidi",
  "chutiya", "gandu", "lodu", "laude", "lawde", "lund", "land", "randi", 
  "raand", "kutiya", "chinal", "mutthal", "harami", "kaminey", 
  "chodu", "chod", "chudai"
];

// Create a regex pattern for each word that allows optional spaces between letters
const hindiRegexPatterns = hindiProfanity.map(word => word.split('').join('\\s*'));

// Regex for Hindi words, ensuring word boundaries and case-insensitivity
const hindiRegex = new RegExp(`\\b(${hindiRegexPatterns.join('|')})\\b`, 'i');

/**
 * Normalizes text to prevent bypasses using repetitive letters or leetspeak
 */
const normalizeHinglish = (text: string): string => {
  return text
    .toLowerCase()
    // Replace common leetspeak
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/\$/g, 's')
    // Remove consecutive duplicate characters (e.g. luuuund -> lund)
    .replace(/(.)\1+/g, '$1');
};

/**
 * Checks if the given text contains any profanity (English or Hindi).
 * @param text The text to check.
 * @returns boolean True if profanity is found.
 */
export const isProfane = (text: string): boolean => {
  if (!text) return false;
  
  if (englishMatcher.hasMatch(text)) return true;
  
  if (hindiRegex.test(text)) return true;
  
  const normalized = normalizeHinglish(text);
  return hindiRegex.test(normalized);
};
