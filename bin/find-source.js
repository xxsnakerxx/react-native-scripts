#! /usr/bin/env node

const fs = require('fs');
const SourceMap = require('source-map');
const chalk = require('chalk');

const scriptName = 'rns-find-source';

const argv = require('yargs')
  .usage(`Usage: yarn ${scriptName} [options]`)
  .option('p', {
    alias: 'path',
    describe: 'path to sourcemap',
    demandOption: true,
    type: 'string',
  })
  .option('l', {
    alias: 'line',
    default: '0:0',
    type: 'string',
  })
  .wrap(null)
  .version()
  .help('help')
  .argv;

const searchLine = +(argv.line.split(':')[0]);
const searchColumn = +(argv.line.split(':')[1]);

(async () => {
  try {
    const mapFileData =
      fs.readFileSync(argv.path, 'utf8');

    const smc = await new SourceMap.SourceMapConsumer(mapFileData);

    const { source, line, column, name } = smc.originalPositionFor({
      line: searchLine,
      column: searchColumn,
    });

    if (source) {
      console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {green Found:}}`);
      console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {yellow ${name} ➤ ${source}:${line}:${column}}}`);
    } else {
      console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {green Nothing found!}}`);
    }

    smc.destroy();
  } catch (error) {
    console.log(chalk`{whiteBright.bold [{cyan ${scriptName}}] {red Something happend!}}`);
    throw error;
  }
})();
