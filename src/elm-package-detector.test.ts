import { expect, test } from '@jest/globals';
import { buildSnapshot, createBuildTarget, parseNameAndNamespace, parsrePackage } from './elm-package-detector';

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
  expect(JSON.parse(JSON.stringify(manifests['emobu/elm.json'])).resolved).toEqual({
    'pkg:github/elm-community/list-extra@8.7.0': {
      'dependencies': [],
      'package_url': 'pkg:github/elm-community/list-extra@8.7.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:github/elm-community/random-extra@3.2.0': {
      'dependencies': [],
      'package_url': 'pkg:github/elm-community/random-extra@3.2.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:github/elm-explorations/test@2.1.0': {
      'dependencies': [],
      'package_url': 'pkg:github/elm-explorations/test@2.1.0',
      'relationship': 'direct',
      'scope': 'development',
    },
    'pkg:github/elm/browser@1.0.2': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/browser@1.0.2',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:github/elm/bytes@1.0.8': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/bytes@1.0.8',
      'relationship': 'indirect',
      'scope': 'development',
    },
    'pkg:github/elm/core@1.0.5': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/core@1.0.5',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:github/elm/html@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/html@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:github/elm/json@1.1.3': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/json@1.1.3',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:github/elm/random@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/random@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:github/elm/time@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/time@1.0.0',
      'relationship': 'direct',
      'scope': 'runtime',
    },
    'pkg:github/elm/url@1.0.0': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/url@1.0.0',
      'relationship': 'indirect',
      'scope': 'runtime',
    },
    'pkg:github/elm/virtual-dom@1.0.3': {
      'dependencies': [],
      'package_url': 'pkg:github/elm/virtual-dom@1.0.3',
      'relationship': 'indirect',
      'scope': 'runtime',
    },
  });
});

test('throws an error when given an invalid format of elm.json', () => {
  expect(() => createBuildTarget(JSON.stringify({ 'thisFieldIsNotAnElmJSON': 42 }), 'elm.json')).toThrow(
    /given file is an invalid format of elm.json/,
  );
});

test('handles github repository', () => {
  expect(parseNameAndNamespace('elm-community/list-extra')).toStrictEqual(['elm-community', 'list-extra']);
});

test('parsrePackage', () => {
  expect(parsrePackage('elm-explorations/test', '2.1.0').toString()).toStrictEqual(
    'pkg:github/elm-explorations/test@2.1.0',
  );
});
