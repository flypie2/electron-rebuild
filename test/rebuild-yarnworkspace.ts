import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { spawnPromise } from 'spawn-rx';

import { expectNativeModuleToBeRebuilt, expectNativeModuleToNotBeRebuilt } from './helpers/rebuild';
import { rebuild } from '../src/rebuild';
import { getProjectRootPath } from '../src/search-module';

const projectRootPath = getProjectRootPath(process.cwd());

describe('rebuild for yarn workspace', function() {
  this.timeout(2 * 60 * 1000);
  const testModulePath = path.resolve(os.tmpdir(), 'electron-rebuild-test');

  const args = {
    buildPath: path.resolve(testModulePath, 'child-workspace'),
    electronVersion: '5.0.13',
    arch: process.arch,
    projectRootPath
  }

  describe('core behavior', () => {
    before(async () => {
      await fs.remove(testModulePath);
      await fs.copy(path.resolve(__dirname, 'fixture/workspace-test'), testModulePath);

      await spawnPromise('yarn', [], {
        cwd: testModulePath,
        stdio: 'ignore'
      });

      await rebuild(args);
    });

    it('should have rebuilt top level prod dependencies', async () => {
      await expectNativeModuleToBeRebuilt(testModulePath, 'ref-napi');
    });

    it('should not have rebuilt top level devDependencies', async () => {
      await expectNativeModuleToNotBeRebuilt(testModulePath, 'ffi-napi');
    });

    after(async () => {
      await fs.remove(testModulePath);
    });
  });
});
