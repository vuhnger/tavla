import { expect, test } from 'bun:test';
import { isNewDeploy } from './deploy';

test('reloads only when both ids exist and differ', () => {
  expect(isNewDeploy('dpl_a', 'dpl_a')).toBe(false);
  expect(isNewDeploy('dpl_a', 'dpl_b')).toBe(true);
  expect(isNewDeploy('', 'dpl_b')).toBe(false);
  expect(isNewDeploy(undefined, 'dpl_b')).toBe(false);
  expect(isNewDeploy('dpl_a', '')).toBe(false);
  expect(isNewDeploy('dpl_a', null)).toBe(false);
  expect(isNewDeploy('dpl_a', undefined)).toBe(false);
});
