import { getInput, startGroup, endGroup } from '@actions/core';
import { context } from '@actions/github';
import { submitSnapshot } from '@github/dependency-submission-toolkit';
import { normalize } from 'path';

import { buildSnapshot } from './elm-package-detector';

async function run(): Promise<void> {
  startGroup('Setup variables');
  const snapshot = buildSnapshot(
    normalize(getInput('elm-json-path', { required: true, trimWhitespace: true })),
    context.job,
    context.runId.toString(),
  );

  await submitSnapshot(snapshot);
  endGroup();
}

run();
