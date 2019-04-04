#! /usr/bin/env node

const { execSync } = require('child_process');
const cwd = process.cwd();
const fs = require('fs');
const chalk = require('chalk');
const pkg = require(`${cwd}/package.json`);

const scriptName = 'rns-build-ios';

const argv = require('yargs')
  .usage(`Usage: yarn ${scriptName} [options]`)
  .option('teamId', {
    demandOption: true,
    type: 'string',
  })
  .option('scheme', {
    demandOption: true,
    type: 'string',
  })
  .option('c', {
    alias: 'configuration',
    demandOption: true,
    type: 'string',
  })
  .option('u', {
    alias: 'upload',
    describe: 'upload to app store',
    type: 'string',
  })
  .option('altoolUser', {
    describe: 'apple ID, required for uploading',
    type: 'string',
  })
  .option('altoolPass', {
    describe: 'app specific password (appleid.apple.com -> Security -> Generate Password), required for uploading',
    type: 'string',
  })
  .option('icloudEnv', {
    default: 'Production',
    describe: 'value for iCloudContainerEnvironment key',
    type: 'string',
  })
  .option('s', {
    alias: 'sourcemap',
    default: true,
    describe: 'build sourcemap',
    type: 'boolean',
  })
  .option('ipaName', {
    default: pkg.name,
    defaultDescription: 'package name',
    describe: 'ipa file name',
    type: 'string',
  })
  .option('ipaSuffix', {
    default: pkg.version,
    defaultDescription: 'package version',
    describe: 'ipa file suffix',
    type: 'string',
  })
  .wrap(null)
  .version()
  .help('help')
  .argv;

const ucfirst = str => str.charAt(0).toUpperCase() + str.slice(1);
const altool = '"/Applications/Xcode.app/Contents/Applications/Application Loader.app' +
  '/Contents/Frameworks/ITunesSoftwareService.framework/Versions/A/Support/altool"';

console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow Building ${argv.scheme}...}}`);

try {
  process.chdir('./ios');

  execSync([
    'xcodebuild',
    `-scheme ${argv.scheme}`,
    `-workspace ${argv.scheme}.xcworkspace`,
    `-configuration ${argv.configuration}`,
    'clean',
    'archive',
    `-archivePath build/${argv.scheme}.xcarchive`,
    `DEVELOPMENT_TEAM=${argv.teamId}`,
  ].join(' '), { stdio: 'inherit' });

  fs.writeFileSync(
    'build/exportOptions.plist',
    [
      '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
      '<plist version="1.0">',
      '<dict>',
      '<key>method</key>',
      '<string>app-store</string>',
      '<key>teamID</key>',
      `<string>${argv.teamId}</string>`,
      '<key>uploadSymbols</key>',
      '<true/>',
      '<key>uploadSymbols</key>',
      '<true/>',
      '<key>iCloudContainerEnvironment</key>',
      `<string>${ucfirst(argv.icloudEnv)}</string>`,
      '</dict>',
      '</plist>',
    ].join('\n'),
  );

  execSync([
    'xcodebuild',
    '-exportArchive',
    `-archivePath build/${argv.scheme}.xcarchive`,
    `-exportPath build`,
    '-exportOptionsPlist build/exportOptions.plist',
    '-allowProvisioningUpdates',
  ].join(' '), { stdio: 'inherit' });

  if (argv.altoolUser && argv.altoolPass) {
    console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow Validating build...}}`);

    execSync([
      `${altool} --validate-app`,
      `-f build/${argv.scheme}.ipa`,
      `-u ${argv.altoolUser}`,
      `-p ${argv.altoolPass}`,
    ].join(' '), { stdio: 'inherit' });

    if (argv.upload) {
      console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow Uploading...}}`);

      execSync([
        `${altool} --upload-app`,
        `-f build/${argv.scheme}.ipa`,
        `-u ${argv.altoolUser}`,
        `-p ${argv.altoolPass}`,
      ].join(' '), { stdio: 'inherit' });

      execSync(`rm build/${argv.scheme}.ipa`, { stdio: 'inherit' });
    }
  }

  execSync('rm build/exportOptions.plist');
  execSync(`rm -r build/${argv.scheme}.xcarchive`);

  if (!argv.upload) {
    const newFileName = `${argv.ipaName}-${argv.ipaSuffix}.ipa`;

    execSync(`mv build/${argv.scheme}.ipa ${newFileName}`, { stdio: 'inherit' });

    console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {green Builded ./ios/${newFileName}}}`);
  }

  process.chdir('../');

  if (argv.sourcemap) {
    execSync(`node ${__dirname}/build-sourcemap.js -p ios -e ${argv.configuration}`, { stdio: 'inherit' });
  }
} catch (error) {
  console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {red Building failed}}`);
  console.error(error);
}
