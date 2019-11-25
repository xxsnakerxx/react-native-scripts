#! /usr/bin/env node

const { execSync } = require('child_process');
const cwd = process.cwd();
const chalk = require('chalk');
const pkg = require(`${cwd}/package.json`);

const scriptName = 'rns-build-sourcemap';

const argv = require('yargs')
  .usage(`Usage: yarn ${scriptName} [options]`)
  .option('f', {
    alias: 'folder',
    default: 'sourcemaps',
    type: 'string',
  })
  .option('p', {
    alias: 'platform',
    choices: ['ios', 'android'],
    demandOption: true,
    type: 'string',
  })
  .option('e', {
    alias: 'env',
    demandOption: true,
    type: 'string',
  })
  .wrap(null)
  .version()
  .help('help')
  .argv;

console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow Building ${argv.platform} ${argv.env} js bundle sourcemap v${pkg.version}...}}`);

const filename = `${argv.platform}.bundle-${pkg.version}-${argv.env}`;

try {
  execSync(`mkdir -p ${cwd}/${argv.folder}`);

  execSync([
    'node "node_modules/react-native/cli.js" bundle',
    '--entry-file index.js',
    `--platform ${argv.platform}`,
    '--dev false',
    '--reset-cache',
    `--bundle-output ${cwd}/${argv.folder}/index.${filename}`,
    `--sourcemap-output ./${argv.folder}/${filename}.map`,
  ].join(' '), { stdio: 'inherit' });

  execSync(`rm ./${argv.folder}/index.${filename}`);

  console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {green Builded ./${argv.folder}/${filename}.map}}`);
} catch (error) {
  console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {red Building failed}}`);
  throw error;
}
