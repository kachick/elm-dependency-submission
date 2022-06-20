import { context } from '@actions/github';

import { readFileSync } from 'fs';

import { BuildTarget, Package, PackageCache, Snapshot } from '@github/dependency-submission-toolkit';
import { PackageURL } from 'packageurl-js';

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions
export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected 'val' to be defined, but received ${val}`);
  }
}

type ElmDependencies = {
  direct: { [key: string]: string };
  indirect: { [key: string]: string };
};

// https://github.com/elm/compiler/blob/9f1bbb558095d81edba5796099fee9981eac255a/docs/elm.json/package.md
type ElmJSON = {
  'type': 'application' | 'package';
  name?: string;
  license?: string;
  version?: string;
  'exposed-modules'?: string[];
  'elm-version': 'string';
  dependencies: ElmDependencies;
  'test-dependencies': ElmDependencies;
};

export function parseNameAndNamespace(depPath: string): [string, string] {
  const namespaceAndName = depPath.split('/');

  switch (namespaceAndName.length) {
    case 1: {
      const [name] = namespaceAndName;
      assertIsDefined(name);
      return ['', encodeURIComponent(name)];
    }
    case 2: {
      const [namespace, name] = namespaceAndName;
      assertIsDefined(namespace);
      assertIsDefined(name);

      return [
        encodeURIComponent(namespace),
        encodeURIComponent(name),
      ];
    }
    default: {
      throw new Error(
        `expectation violated: package '${depPath}' has more than one slash (/) in name`,
      );
    }
  }
}

export function parseDependencies(cache: PackageCache, dependencies: { [key: string]: string }): Array<Package> {
  return Object.entries(dependencies).map(([depPath, version]) => {
    const [namespace, name] = parseNameAndNamespace(depPath);
    const packageUrl = new PackageURL('elm', namespace, name, version, null, null);
    return cache.package(packageUrl);
  });
}

export function createBuildTarget(elmJSON: ElmJSON): BuildTarget {
  const cache = new PackageCache();
  const topLevelDependencies = parseDependencies(cache, elmJSON.dependencies.direct);

  const buildTarget = new BuildTarget(elmJSON.name || 'NONAME');
  for (const pkg of topLevelDependencies) {
    buildTarget.addBuildDependency(pkg);
  }
  return buildTarget;
}

export function buildSnapshot(elmJsonPath: string, job: string, runId: string): Snapshot {
  const elmJson = JSON.parse(readFileSync(elmJsonPath).toString()) as ElmJSON;
  const buildTarget = createBuildTarget(elmJson);
  const snapshot = new Snapshot(
    {
      name: 'kachick/elm-dependency-submission',
      url: 'https://github.com/kachick/elm-dependency-submission',
      version: '0.0.1',
    },
    context,
    {
      correlator: `${job}-${elmJsonPath}`,
      id: runId,
    },
  );

  snapshot.addManifest(buildTarget);

  return snapshot;
}
