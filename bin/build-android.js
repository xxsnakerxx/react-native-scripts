#! /usr/bin/env node

const { execSync } = require('child_process');
const cwd = process.cwd();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const pkg = require(`${cwd}/package.json`);

const scriptName = 'rns-build-android';

const argv = require('yargs')
  .usage(`Usage: yarn ${scriptName} [options]`)
  .option('t', {
      alias: 'type',
      demandOption: true,
      describe: 'gradle buildType',
      type: 'string',
  })
  .option('u', {
    alias: 'upload',
    describe: 'upload to google play (via https://github.com/Triple-T/gradle-play-publisher)',
    type: 'boolean',
  })
  .option('s', {
      alias: 'sourcemap',
      default: true,
      describe: 'build sourcemap',
      type: 'boolean',
  })
  .option('apkName', {
      default: pkg.name,
      defaultDescription: 'package name',
      describe: 'apk file name',
      type: 'string',
  })
  .option('apkSuffix', {
      default: pkg.version,
      defaultDescription: 'package version',
      describe: 'apk file suffix',
      type: 'string',
  })
  .wrap(null)
  .version()
  .help('help')
  .argv;

const ucfirst = str => str.charAt(0).toUpperCase() + str.slice(1);

console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow Building ${argv.t}...}}`);

try {
  process.chdir('./android');

  if (argv.upload) {
    execSync([
      `./gradlew publish${ucfirst(argv.type)}Apk`,
      `--track ${argv.type === 'release' ? 'production' : 'internal'}`,
    ].join(' '), { stdio: 'inherit' });
  } else {
    execSync(`./gradlew assemble${ucfirst(argv.type)}`, { stdio: 'inherit' });

    const apksDirPath = path.resolve(path.join('./app/build/outputs/apk', argv.type));

    fs.readdirSync(path.resolve(cwd, apksDirPath))
      .forEach((item) => {
        const filename = path.join(apksDirPath, item);
        const stat = fs.statSync(filename);

        if (!stat.isDirectory() && filename.indexOf('.apk') > 0) {
          const nameParts = filename.split('-');
          let newFileName = filename;

          // modulename-screendensityABI-buildvariant.apk
          // it can be
          // app-x-y-release.apk
          // app-x-release.apk
          // app-release.apk
          if (nameParts.length >= 3) {
            const splitType = nameParts.slice(1, -1).join('-');
            newFileName = `${argv.apkName}-${splitType}-${argv.type}-${argv.apkSuffix}.apk`
          } else {
            newFileName = `${argv.apkName}-${argv.type}-${argv.apkSuffix}.apk`
          }

          execSync(`mv ${filename} ./${newFileName}`);

          console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {green Builded ./android/${newFileName}}}`);
        }
      });
  }

  process.chdir('../');

  if (argv.sourcemap) {
    execSync([
      `node ${__dirname}/build-sourcemap.js`,
      '-p android',
      `-e ${argv.type === 'release' ? 'production' : argv.type}`,
    ].join(' '), { stdio: 'inherit' });
  }
} catch (error) {
  console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {red Building failed}}`);
  throw error;
}
