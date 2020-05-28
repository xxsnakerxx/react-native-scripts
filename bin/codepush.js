#! /usr/bin/env node

const { execSync } = require('child_process');
const chalk = require('chalk');

const scriptName = 'rns-codepush';

let platforms = ['ios', 'android'];

const argv = require('yargs')
  .usage(`Usage: yarn ${scriptName} [options] [code-push cli options]
       run "code-push release-react --help" to see other available code-push options`)
  .option('app', {
    describe: 'app name',
    demandOption: true,
    type: 'string',
  })
  .option('e', {
    alias: 'env',
    demandOption: true,
    type: 'string',
  })
  .option('p', {
    alias: 'platform',
    choices: platforms.concat(''),
    default: '',
    defaultDescription: 'both',
    type: 'string',
  })
  .option('s', {
    alias: 'sourcemap',
    default: true,
    describe: 'build sourcemap',
    type: 'boolean',
  })
  .option('t', {
    alias: 'tag',
    default: true,
    describe: 'set git tag "codepush-${platform}-${stg|prod}"',
    type: 'boolean',
  })
  .wrap(null)
  .version()
  .help('help')
  .argv;

const ucfirst = str => str.charAt(0).toUpperCase() + str.slice(1);

console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow Codepushing ${argv.app} app on ${argv.env} for ${platforms.join(', ')}...}}`);

try {
  const codepushArgs = {};

  Object.keys(argv).forEach((arg) => {
    if ([
      'app',
      'e',
      'env',
      'p',
      'platform',
      's',
      'sourcemap',
      't',
      'tag',
      '$0',
      '_'
    ].indexOf(arg) < 0) {
      const prefix = arg.length > 1 ? '--' : '-';

      codepushArgs[`${prefix}${arg}`] = typeof argv[arg] === 'boolean'
        ? null
        : ` ${argv[arg]}`;
    }
  })

  if (argv.platform) {
    platforms = platforms.filter(item => item === argv.platform);
  }

  if (argv.tag) {
    execSync('git fetch --tags -f', { stdio: 'inherit' });
  }

  platforms.forEach((platform) => {
    console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow Codepushing to ${platform}...}}`);

    execSync([
      'code-push release-react',
      `${argv.app}-${platform} ${platform}`,
      `--deploymentName ${ucfirst(argv.env)}`,
    ]
      .concat(Object.keys(codepushArgs)
        .map(arg => `${arg}${codepushArgs[arg] || ''}`)
      )
      .filter(Boolean)
      .join(' '), { stdio: 'inherit' });

    if (argv.tag) {
      execSync(`git tag codepush-${platform}-${argv.env.toLowerCase() === 'staging' ? 'stg' : 'prod'} -f`, { stdio: 'inherit' });
    }

    if (argv.sourcemap) {
      execSync(`node ${__dirname}/build-sourcemap.js -p ${platform} -e ${argv.env}`, { stdio: 'inherit' });
    }
  });

  if (argv.tag) {
    execSync('git push --tags -f', { stdio: 'inherit' });
  }

  console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {green Codepushed!}}`);
} catch (error) {
  console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {red Codepushing failed}}`);
  throw error;
}
