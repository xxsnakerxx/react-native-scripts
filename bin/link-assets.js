#! /usr/bin/env node

const cwd = process.cwd();
const chalk = require('chalk');
const path = require('path');
const { uniqBy } = require('lodash');

const scriptName = 'rns-link-assets';

require('yargs')
  .usage(`Usage: yarn ${scriptName} [options]`)
  .version()
  .help('help')
  .wrap(null)
  .argv

console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow Linking assets...}}`);

try {
  const dedupeAssets = assets => uniqBy(assets, asset => path.basename(asset));

  const getPlatforms = require('@react-native-community/cli/build/tools/getPlatforms').default;
  const getAssets = require('@react-native-community/cli/build/tools/getAssets').default;
  const getProjectConfig = require('@react-native-community/cli/build/commands/link/getProjectConfig').default;
  const getProjectDependencies = require('@react-native-community/cli/build/commands/link/getProjectDependencies').default;
  const getDependencyConfig = require('@react-native-community/cli/build/commands/link/getDependencyConfig').default;
  const linkAssets = require('@react-native-community/cli/build/commands/link/linkAssets').default;

  const ctx = { root: cwd };

  const platforms = getPlatforms(cwd);
  const project = getProjectConfig(ctx, platforms);
  const projectAssets = getAssets(cwd);
  const dependencies = getProjectDependencies(cwd);
  const depenendenciesConfig = dependencies
    .map(dependnecy => getDependencyConfig(ctx, platforms, dependnecy));

  const assets = dedupeAssets(
    depenendenciesConfig.reduce(
      (acc, dependency) => acc.concat(dependency.assets),
      projectAssets,
    ),
  );

  linkAssets(platforms, project, assets);
} catch (error) {
  console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {red Linking failed}}`);
  console.error(error);
}
