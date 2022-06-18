import { expect, test } from '@jest/globals';
import { buildSnapshot } from './elm-package-detector';

test('works', () => {
  expect(buildSnapshot('elm-example/elm.json', 'super detect job', '42')).toBe('approximately 7.57 minutes');
});
