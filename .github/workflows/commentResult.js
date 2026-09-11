const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const path = require('path');

function main() {
    const [, , log, outDir, adapterPath] = process.argv;
    const file = readFileSync(log, 'utf-8');

    const errorString = '------ ERROR ------';
    const summaryIndex = file.indexOf('------ TVL ------');
    const errorIndex = file.indexOf(errorString);
    let body;

    if (summaryIndex != -1) {
        body = `The adapter at ${adapterPath} exports TVL:
        \n \n ${file.substring(summaryIndex + 17).replaceAll('\n', '\n    ')}`;
    } else if (errorIndex != -1) {
        body = `Error while running adapter at ${adapterPath ?? ''}:
        \n \n ${file.split(errorString)[1].replaceAll('\n', '\n    ')}`;
    } else {
        return;
    }

    mkdirSync(outDir, { recursive: true });
    const safeName = (adapterPath || 'general').replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${process.pid}-${safeName}.md`;
    writeFileSync(path.join(outDir, fileName), body);
}
main();
