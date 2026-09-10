import dealSignalPatterns from './dealSignalPatterns.js';

export const dealPhrasePatternSource = `\\b(?:${dealSignalPatterns.alternatives.join('|')})\\b`;
export const dealSignalPatternSource = `[%\\p{Sc}]|(?:${dealPhrasePatternSource})`;

const dealSignalPattern = new RegExp(dealSignalPatternSource, 'iu');

export function hasDealRelevanceSignal(title: string, body: string) {
  return dealSignalPattern.test(`${title} ${body}`);
}