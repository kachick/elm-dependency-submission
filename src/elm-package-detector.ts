import { readFileSync } from 'fs';
import { BuildTarget, Package, PackageCache, Snapshot } from '@github/dependency-submission-toolkit';
import { context } from '@actions/github';
import { PackageURL } from 'packageurl-js';
import { assertIsDefined } from './typeguards';
import { z } from 'zod';

// https://github.com/colinhacks/zod/tree/20a45a20a344c48fc8cd1b630adcb822d439e70d#json-type
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]));

const elmDependenciesSchema = z.record(z.string(), z.string());

type ElmDependencies = z.infer<typeof elmDependenciesSchema>;

const elmDependenciesSetSchema = z.object({
  direct: elmDependenciesSchema,
  indirect: elmDependenciesSchema,
});

// https://github.com/elm/compiler/blob/9f1bbb558095d81edba5796099fee9981eac255a/docs/elm.json/package.md
const elmJSONSchema = z.object({
  type: z.enum(['application', 'package']),
  name: z.optional(z.string()),
  license: z.optional(z.string()),
  version: z.optional(z.string()),
  'exposed-modules': z.optional(z.array(z.string())),
  'elm-version': z.string(),
  dependencies: elmDependenciesSetSchema,
  'test-dependencies': elmDependenciesSetSchema,
});

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

export function parseDependencies(
  cache: Readonly<PackageCache>,
  dependencies: Readonly<ElmDependencies>,
): Package[] {
  return Object.entries(dependencies).map(([depPath, version]) => {
    const [namespace, name] = parseNameAndNamespace(depPath);
    const packageUrl = new PackageURL('elm', namespace, name, version, null, null);
    return cache.package(packageUrl);
  });
}

export function createBuildTarget(elmJSONString: string): BuildTarget {
  const maybeElmJSON = elmJSONSchema.safeParse(jsonSchema.parse(JSON.parse(elmJSONString)));

  if (!maybeElmJSON.success) {
    throw new Error(`given file is an invalid format of elm.json: ${maybeElmJSON.error.message}`);
  }

  const elmJSON = maybeElmJSON.data;

  const cache = new PackageCache();
  const topLevelDirectDependencies = parseDependencies(cache, elmJSON.dependencies.direct);
  const topLevelIndirectDependencies = parseDependencies(cache, elmJSON.dependencies.indirect);
  const testDirectDependencies = parseDependencies(cache, elmJSON['test-dependencies'].direct);
  const testIndirectDependencies = parseDependencies(cache, elmJSON['test-dependencies'].indirect);

  const buildTarget = new BuildTarget(elmJSON.name ?? 'NONAME');
  for (const pkg of topLevelDirectDependencies) {
    buildTarget.addBuildDependency(pkg);
  }
  for (const pkg of topLevelIndirectDependencies) {
    buildTarget.addIndirectDependency(pkg, 'runtime');
  }
  for (const pkg of testDirectDependencies) {
    buildTarget.addDirectDependency(pkg, 'development');
  }
  for (const pkg of testIndirectDependencies) {
    buildTarget.addIndirectDependency(pkg, 'development');
  }
  return buildTarget;
}

export function buildSnapshot(elmJsonPath: string, job: string, runId: string): Snapshot {
  const buildTarget = createBuildTarget(readFileSync(elmJsonPath).toString());
  const snapshot = new Snapshot(
    {
      name: 'kachick/elm-dependency-submission',
      url: 'https://github.com/kachick/elm-dependency-submission',
      version: '0.0.1',
    },
    context,
    {
      correlator: `${job}: ${elmJsonPath}`,
      id: runId,
    },
  );

  snapshot.addManifest(buildTarget);

  return snapshot;
}
