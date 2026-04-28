const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

function safeReadJson(p) {
    if (!p || !existsSync(p)) return null;
    try { return JSON.parse(readFileSync(p, 'utf-8')); }
    catch { return null; }
}

function buildLegacyBody(file, adapterPath) {
    const errorString = '------ ERROR ------';
    const summaryIndex = file.indexOf('------ TVL ------');
    const errorIndex = file.indexOf(errorString);

    if (summaryIndex !== -1) {
        return `The adapter at ${adapterPath} exports TVL:
        \n \n ${file.substring(summaryIndex + 17).replaceAll('\n', '\n    ')}`;
    }
    if (errorIndex !== -1) {
        return `Error while running adapter at ${adapterPath ?? ''}:
        \n \n ${file.split(errorString)[1].replaceAll('\n', '\n    ')}`;
    }
    return null;
}

function buildDiffBody({ baseline, current, adapterPath, legacyBody }) {
    const { computeDiff } = require('./computeDiff');
    let diffMd;
    try { diffMd = computeDiff({ baseline, current, adapterPath }); }
    catch { return null; }
    if (!legacyBody) return diffMd;
    return `${diffMd}\n\n<details><summary>Full PR-run output</summary>\n\n${legacyBody}\n\n</details>`;
}

function main() {
    const [, , log, outDir, adapterPath, baselineJsonPath, currentJsonPath] = process.argv;
    const file = readFileSync(log, 'utf-8');

    const legacyBody = buildLegacyBody(file, adapterPath);
    const baseline = safeReadJson(baselineJsonPath);
    const current = safeReadJson(currentJsonPath);

    let body = null;
    if (baseline && current && !current.errored && !baseline.errored) {
        body = buildDiffBody({ baseline, current, adapterPath, legacyBody });
    }
    if (!body) body = legacyBody;
    if (!body) return;

    mkdirSync(outDir, { recursive: true });
    const safeName = (adapterPath || 'general').replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${process.pid}-${safeName}.md`;
    writeFileSync(path.join(outDir, fileName), body);
}
main();
