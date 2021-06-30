import * as os from 'os';
import * as core from '@actions/core';
import {issueCommand} from '@actions/core/lib/command';
import fs from 'fs';
import path from 'path';

let _tmpDir: string;
export const osPlat: string = os.platform();
export const osArch: string = os.arch();

export interface Inputs {
  version: string;
  driver: string;
  driverOpts: string[];
  buildkitdFlags: string;
  install: boolean;
  use: boolean;
  endpoint: string;
  config: string;
  githubToken: string;
}

export function tmpDir(): string {
  if (!_tmpDir) {
    _tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docker-setup-buildx-')).split(path.sep).join(path.posix.sep);
  }
  return _tmpDir;
}

export async function getInputs(): Promise<Inputs> {
  return {
    version: core.getInput('version'),
    driver: core.getInput('driver') || 'docker-container',
    driverOpts: await getInputList('driver-opts', true),
    buildkitdFlags:
      core.getInput('buildkitd-flags') ||
      '--allow-insecure-entitlement security.insecure --allow-insecure-entitlement network.host',
    install: core.getBooleanInput('install'),
    use: core.getBooleanInput('use'),
    endpoint: core.getInput('endpoint'),
    config: core.getInput('config'),
    githubToken: core.getInput('github-token')
  };
}

export async function getInputList(name: string, ignoreComma?: boolean): Promise<string[]> {
  const items = core.getInput(name);
  if (items == '') {
    return [];
  }
  return items
    .split(/\r?\n/)
    .filter(x => x)
    .reduce<string[]>(
      (acc, line) => acc.concat(!ignoreComma ? line.split(',').filter(x => x) : line).map(pat => pat.trim()),
      []
    );
}

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// FIXME: Temp fix https://github.com/actions/toolkit/issues/777
export function setOutput(name: string, value: any): void {
  issueCommand('set-output', {name}, value);
}
