import {
  debug,
  info,
  getInput,
  getBooleanInput,
  setSecret,
  setFailed,
  isDebug,
  startGroup,
  endGroup,
  error,
} from '@actions/core';
import { getOctokit, context } from '@actions/github';

// eslint-disable-next-line import/no-unresolved
import { fetchJobIDs } from './github-api.js';
import {
  wait,
  // eslint-disable-next-line import/no-unresolved
} from './wait.js';

import path from 'path';
import { readFileSync } from 'fs';

import { Package, PackageCache, Snapshot, submitSnapshot } from '@github/dependency-submission-toolkit';

// import { processGoGraph, processGoBuildTarget } from './process';

type ElmDependencies = {
  direct: { [key: string]: string };
  indirect: { [key: string]: string };
};

type ElmJSON = {
  dependencies: ElmDependencies;
  'test-dependencies': ElmDependencies;
};

function parseDependencies(cache: PackageCache, dependencies: { [key: string]: string }): Array<Package> {
  return Object.entries(dependencies).map(([name, _version]) => new Package(name));
}

async function run(): Promise<void> {
  startGroup('Setup variables');

  const elmJsonPath = path.normalize(getInput('elm-json-path', { required: true, trimWhitespace: false }));
  // const elmToolingJsonPath = path.normalize(
  //   getInput('elm-tooling-json-path', { required: true, trimWhitespace: false }),
  // );
  const token = getInput('github-token', { required: true, trimWhitespace: false });
  setSecret(token);

  const elmJson = JSON.parse(readFileSync(elmJsonPath)) as ElmJSON;
  // const elmToolingJson = JSON.parse(readFileSync(elmToolingJsonPath));

  const snapshot = new Snapshot(
    {
      name: 'kachick/elm-dependency-submission',
      url: 'https://github.com/kachick/elm-dependency-submission',
      version: '0.0.1',
    },
    context,
    {
      correlator: `${context.job}-direct`,
      id: context.runId.toString(),
    },
  );

  const cache = new PackageCache();
  const topLevelDependencies = parseDependencies(cache, elmJson.dependencies.direct);

  snapshot.addManifest({
    resolved: undefined,
    name: '',
    addDirectDependency: function(pkg: Package, scope?: DependencyScope | undefined): void {
      throw new Error('Function not implemented.');
    },
    addIndirectDependency: function(pkg: Package, scope?: DependencyScope | undefined): void {
      throw new Error('Function not implemented.');
    },
    hasDependency: function(pkg: Package): boolean {
      throw new Error('Function not implemented.');
    },
    lookupDependency: function(pkg: Package): Dependency | undefined {
      throw new Error('Function not implemented.');
    },
    countDependencies: function(): number {
      throw new Error('Function not implemented.');
    },
    filterDependencies: function(predicate: (dep: Dependency) => boolean): Package[] {
      throw new Error('Function not implemented.');
    },
    directDependencies: function(): Package[] {
      throw new Error('Function not implemented.');
    },
    indirectDependencies: function(): Package[] {
      throw new Error('Function not implemented.');
    },
  });

  const {
    repo: { repo, owner },
    payload,
    runId,
    sha,
  } = context;
  const pr = payload.pull_request;
  let commitSha = sha;
  if (pr && 'head' in pr) {
    const { head } = pr;
    if (typeof head === 'object' && 'sha' in head) {
      commitSha = head.sha;
    } else {
      if (isDebug()) {
        debug(JSON.stringify(pr, null, 2));
      }
      error('github context has unexpected format: missing context.payload.pull_request.head.sha');
      setFailed('unexpected failure occurred');
      return;
    }
  }

  info(JSON.stringify({ triggeredCommitSha: commitSha, ownRunId: runId }, null, 2));

  const repositoryInfo = {
    owner,
    repo,
  } as const;

  const isEarlyExit = getBooleanInput('early-exit', { required: true, trimWhitespace: true });
  const isDryRun = getBooleanInput('dry-run', { required: true, trimWhitespace: true });

  const githubToken = getInput('github-token', { required: true, trimWhitespace: false });
  setSecret(githubToken);
  const octokit = getOctokit(githubToken);

  endGroup();

  if (isDryRun || isEarlyExit) {
    return;
  }

  await wait(42);

  startGroup('Get own job_id');

  // eslint-disable-next-line camelcase
  const ownJobIDs = await fetchJobIDs(octokit, { ...repositoryInfo, run_id: runId });
  info(JSON.stringify({ ownJobIDs: [...ownJobIDs] }, null, 2));

  endGroup();
}

run();
