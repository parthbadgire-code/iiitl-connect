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

// Regex for Hindi words, ensuring word boundaries and case-insensitivity
const hindiRegex = new RegExp(`\\b(${hindiProfanity.join('|')})\\b`, 'i');

/**
 * Checks if the given text contains any profanity (English or Hindi).
 * @param text The text to check.
 * @returns boolean True if profanity is found.
 */
export const isProfane = (text: string): boolean => {
  if (!text) return false;
  return englishMatcher.hasMatch(text) || hindiRegex.test(text);
};
