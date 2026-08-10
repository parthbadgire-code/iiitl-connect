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

// Words that MUST have word boundaries to avoid false positives (e.g. "island" contains "land", "blunder" contains "lund")
const exactHindiProfanity = [
  "mc", "bc", "land", "lund", "laude", "chod", "randi", "lodu"
];

// Longer, distinct words that can be matched even if they are mashed together without spaces (e.g. "gandumadarchod")
const jointHindiProfanity = [
  "bsdk", "bhenchod", "behenchod", "madarchod", "bhosdike", 
  "bhosada", "bhosidi", "chutiya", "gandu", "lawde", 
  "raand", "kutiya", "chinal", "mutthal", "harami", 
  "kaminey", "chodu", "chudai"
];

// 1. Spaced pattern WITH boundaries (\b) for ALL words (matches "g a n d u" and "b c")
const allWords = [...exactHindiProfanity, ...jointHindiProfanity];
const spacedRegexPatterns = allWords.map(word => word.split('').join('\\s*'));
const hindiSpacedRegex = new RegExp(`\\b(${spacedRegexPatterns.join('|')})\\b`, 'i');

// 2. Joint pattern WITHOUT boundaries but ONLY for the distinct joint words (matches "chutiyamadarchod")
const hindiJointRegex = new RegExp(`(${jointHindiProfanity.join('|')})`, 'i');

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
  
  if (hindiSpacedRegex.test(text) || hindiJointRegex.test(text)) return true;
  
  const normalized = normalizeHinglish(text);
  return hindiSpacedRegex.test(normalized) || hindiJointRegex.test(normalized);
};
