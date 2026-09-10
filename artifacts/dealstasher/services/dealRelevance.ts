const dealSignalPattern =
  /[%\p{Sc}]|(?:\b(?:sales?|deals?|discount(?:ed|s)?|promos?|promotions?|coupons?|clearance|bogo|rewards?|offers?|cash\s*back|free\s+shipping|flash\s+sale|price\s+drop|limited\s+time|ends\s+(?:today|soon)|expires?\s+(?:today|soon)|use\s+(?:a\s+)?code|promo\s+code|members?['’]?\s+price|special\s+offer|exclusive\s+offer|lowest\s+price|buy\s+\d+\s*,?\s*get\s+\d+|\d+\s*(?:percent|per\s*cent)\s+off)\b)/iu;

export function hasDealRelevanceSignal(title: string, body: string) {
  return dealSignalPattern.test(`${title} ${body}`);
}