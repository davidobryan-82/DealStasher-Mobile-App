import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import {
  dealPhrasePatternSource,
  hasDealRelevanceSignal,
} from '../services/dealRelevance.ts';

const require = createRequire(import.meta.url);
const notificationPlugin = require('../plugins/withNotificationCapture.js');
const nativeListenerSource =
  notificationPlugin.nativeFiles['DealStasherNotificationListenerService.java'];
const nativePatternSource = nativeListenerSource.match(
  /Pattern\.compile\(\s*"([^"]+)"\s*\)/,
)?.[1];

assert.ok(nativePatternSource, 'native listener should define its deal signal pattern');

const nativePhrasePattern = new RegExp(
  nativePatternSource.replace(/^\(\?iu\)/, '').replace(/\\\\/g, '\\'),
  'iu',
);

function nativeHasDealRelevanceSignal(title, body) {
  const text = `${title} ${body}`;
  return /[%\p{Sc}]/u.test(text) || nativePhrasePattern.test(text);
}

test('JavaScript and Android accept the same representative deal signals', () => {
  const examples = [
    { title: 'Weekend price drop', body: 'Now only $19.99', relevant: true },
    { title: 'Member savings', body: 'Take 25% off today', relevant: true },
    { title: 'Shipping update', body: 'Free shipping on your order', relevant: true },
    { title: 'Checkout reminder', body: 'Use code SAVE20 at checkout', relevant: true },
    { title: 'Package delivered', body: 'Your order arrived at the door', relevant: false },
    { title: 'Account notice', body: 'Your password was changed', relevant: false },
  ];

  for (const example of examples) {
    assert.equal(
      hasDealRelevanceSignal(example.title, example.body),
      example.relevant,
      `JavaScript rule for "${example.title}: ${example.body}"`,
    );
    assert.equal(
      nativeHasDealRelevanceSignal(example.title, example.body),
      example.relevant,
      `Android rule for "${example.title}: ${example.body}"`,
    );
  }
});

test('the generated Android regex comes from the shared signal list', () => {
  const expectedJavaPattern = `(?iu)${dealPhrasePatternSource.replace(/\\/g, '\\\\')}`;
  assert.equal(nativePatternSource, expectedJavaPattern);
});