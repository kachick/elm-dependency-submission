import { expect, test } from '@jest/globals';
import { buildSnapshot, createBuildTarget, parseNameAndNamespace } from './elm-package-detector';

test('builds snapshot for valid elm.json', () => {
  const { manifests, detector, job, version, scanned } = buildSnapshot(
    'emobu/elm.json',
    'awesome detect',
    '42',
  );
  expect(detector).toEqual({
    'name': 'kachick/elm-dependency-submission',
    'url': 'https://github.com/kachick/elm-dependency-submission',
    'version': '0.0.1',
  });
  expect(job).toEqual({ 'correlator': 'awesome detect: emobu/elm.json', 'id': '42' });
  expect(version).toEqual(0);
  expect(scanned).toEqual(expect.stringMatching('\\d{4}-\\d{2}-\\d{2}T\\S+'));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  expect(JSON.parse(JSON.stringify(manifests['NONAME'])).resolved).toEqual({
    'pkg:elm/github.com/elm-community/list-extra@8.7.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm-community/list-extra@8.7.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm-community/random-extra@3.2.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm-community/random-extra@3.2.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm-explorations/test@2.1.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm-explorations/test@2.1.0',
      'relationship': 'direct',
      'scope': 'development',
    },
    'pkg:elm/github.com/elm/browser@1.0.2': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/browser@1.0.2',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm/bytes@1.0.8': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/bytes@1.0.8',
      'relationship': 'indirect',
      'scope': 'development',
    },
    'pkg:elm/github.com/elm/core@1.0.5': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/core@1.0.5',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm/html@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/html@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm/json@1.1.3': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/json@1.1.3',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm/random@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/random@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm/time@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/time@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm/url@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/url@1.0.0',
      'relationship': 'indirect',
      'scope': 'runtime',
    },
    'pkg:elm/github.com/elm/virtual-dom@1.0.3': {
      'dependencies': [],
      'package_url': 'pkg:elm/github.com/elm/virtual-dom@1.0.3',
      'relationship': 'indirect',
      'scope': 'runtime',
    },
  });
});

test('throws an error when given an invalid format of elm.json', () => {
  expect(() => createBuildTarget(JSON.stringify({ 'thisFieldIsNotAnElmJSON': 42 }))).toThrow(
    /given file is an invalid format of elm.json/,
  );
});

test('handles github repository', () => {
  expect(parseNameAndNamespace('elm-community/list-extra')).toStrictEqual(['github.com/elm-community', 'list-extra']);
});
