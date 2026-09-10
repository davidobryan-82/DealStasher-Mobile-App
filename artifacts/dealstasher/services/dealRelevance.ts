const currencyOrPercentPattern = /[%\p{Sc}]/u;

export function hasDealRelevanceSignal(title: string, body: string) {
  return currencyOrPercentPattern.test(`${title} ${body}`);
}