#! /usr/bin/env node

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

  const linkAssets = require('@react-native-community/cli/build/commands/link/linkAssets').default;
  const loadConfig = require('@react-native-community/cli/build/tools/config').default;

  const { platforms, dependencies, project, assets } = loadConfig();

  const allAssets = dedupeAssets(
    Object.keys(dependencies)
      .map(key => dependencies[key])
      .reduce(
        (acc, dependency) => acc.concat(dependency.assets),
        assets,
    ),
  );

  linkAssets(platforms, project, allAssets);
} catch (error) {
  console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {red Linking failed}}`);
  throw error;
}
