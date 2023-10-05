import test from 'node:test';
import assert from 'node:assert';
import { buildSnapshot, createBuildTarget, parseNameAndNamespace, parsePackage } from './elm-package-detector.ts';

test('builds snapshot for valid elm.json', () => {
  const { manifests, detector, job, version, scanned } = buildSnapshot(
    'emobu/elm.json',
    'awesome detect',
    '42',
  );
  assert.deepStrictEqual(detector, {
    'name': 'kachick/elm-dependency-submission',
    'url': 'https://github.com/kachick/elm-dependency-submission',
    'version': '0.0.1',
  });
  assert.deepStrictEqual(job, { 'correlator': 'awesome detect: emobu/elm.json', 'id': '42' });
  assert.strictEqual(version, 0);
  assert.match(scanned, /\d{4}-\d{2}-\d{2}T\S+/);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(manifests['emobu/elm.json'])).resolved, {
    'pkg:elm/elm-community/list-extra@8.7.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm-community/list-extra@8.7.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/elm-community/random-extra@3.2.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm-community/random-extra@3.2.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/elm-explorations/test@2.1.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm-explorations/test@2.1.0',
      'relationship': 'direct',
      'scope': 'development',
    },
    'pkg:elm/elm/browser@1.0.2': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/browser@1.0.2',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/elm/bytes@1.0.8': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/bytes@1.0.8',
      'relationship': 'indirect',
      'scope': 'development',
    },
    'pkg:elm/elm/core@1.0.5': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/core@1.0.5',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/elm/html@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/html@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/elm/json@1.1.3': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/json@1.1.3',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/elm/random@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/random@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/elm/time@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/time@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/elm/url@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/url@1.0.0',
      'relationship': 'indirect',
      'scope': 'runtime',
    },
    'pkg:elm/elm/virtual-dom@1.0.3': {
      'dependencies': [],
      'package_url': 'pkg:elm/elm/virtual-dom@1.0.3',
      'relationship': 'indirect',
      'scope': 'runtime',
    },
  });
});

test('throws an error when given an invalid format of elm.json', () => {
  assert.throws(
    () => createBuildTarget(JSON.stringify({ 'thisFieldIsNotAnElmJSON': 42 }), 'elm.json'),
    /given file is an invalid format of elm.json/,
  );
});

test('handles github repository', () => {
  assert.deepStrictEqual(parseNameAndNamespace('elm-community/list-extra'), ['elm-community', 'list-extra']);
});

test('parsePackage', () => {
  assert.strictEqual(parsePackage('elm-explorations/test', '2.1.0').toString(), 'pkg:elm/elm-explorations/test@2.1.0');
});
