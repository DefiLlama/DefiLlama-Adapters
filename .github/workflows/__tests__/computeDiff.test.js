const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  computeDiff,
  formatUsd,
  formatSignedUsd,
  formatPct,
  classifyDelta,
  partitionRows,
} = require('../computeDiff');

const SCHEMA = 'tvl-baseline-v1';
const baseline = (totals = {}, extras = {}) => ({ schema: SCHEMA, errored: false, totals, ...extras });

test('formatUsd: scales by suffix and handles edge cases', () => {
  const cases = [
    [0, '$0'],
    [123.45, '$123.45'],
    [1_500, '$1.50k'],
    [12_500_000, '$12.50M'],
    [2_500_000_000, '$2.50B'],
    [3_000_000_000_000, '$3.00T'],
    [-1_500_000, '-$1.50M'],
    [null, '—'],
    [undefined, '—'],
    [NaN, '—'],
    [Infinity, '—'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(formatUsd(input), expected, `formatUsd(${input})`);
  }
});

test('formatSignedUsd: + prefix for positive, no prefix for negative', () => {
  assert.equal(formatSignedUsd(100_000), '+$100.00k');
  assert.equal(formatSignedUsd(-200_000), '-$200.00k');
  assert.equal(formatSignedUsd(0), '$0');
  assert.equal(formatSignedUsd(null), '—');
});

test('formatPct: standard, edge, and negligible cases', () => {
  assert.equal(formatPct(100, 110), '+10.00%');
  assert.equal(formatPct(100, 90), '-10.00%');
  assert.equal(formatPct(100, 100), '0%');
  assert.equal(formatPct(0, 100), 'new');
  assert.equal(formatPct(null, 100), 'new');
  assert.equal(formatPct(100, null), 'removed');
  assert.equal(formatPct(0, 0), '0%');
  assert.equal(formatPct(null, null), '—');
  assert.equal(formatPct(1_000_000, 1_000_001), '0%');
});

test('classifyDelta: covers add/remove/changed/unchanged', () => {
  assert.equal(classifyDelta(null, 100), 'added');
  assert.equal(classifyDelta(100, null), 'removed');
  assert.equal(classifyDelta(100, 200), 'changed');
  assert.equal(classifyDelta(100, 100.5), 'unchanged');
  assert.equal(classifyDelta(null, null), 'unchanged');
});

test('partitionRows: 0.1% threshold; added/removed always significant', () => {
  const rows = [
    { label: 'a', baseline: 1_000_000, current: 1_000_500, classification: 'unchanged' },
    { label: 'b', baseline: 1_000_000, current: 1_002_000, classification: 'changed' },
    { label: 'c', baseline: null,      current: 50,        classification: 'added' },
    { label: 'd', baseline: 50,        current: null,      classification: 'removed' },
    { label: 'e', baseline: 0,         current: 0,         classification: 'unchanged' },
    { label: 'f', baseline: 1_000_000, current: 1_001_000, classification: 'changed' },
  ];
  const { significant, quiet } = partitionRows(rows);
  assert.deepEqual(significant.map(r => r.label).sort(), ['b', 'c', 'd', 'e', 'f']);
  assert.deepEqual(quiet.map(r => r.label), ['a']);
});

test('computeDiff: throws on missing schema', () => {
  assert.throws(() => computeDiff({ baseline: {}, current: baseline(), adapterPath: 'p' }), /baseline missing or wrong schema/);
  assert.throws(() => computeDiff({ baseline: baseline(), current: {}, adapterPath: 'p' }), /current missing or wrong schema/);
});

test('computeDiff: renders headline diff with totals and per-chain', () => {
  const md = computeDiff({
    baseline: baseline({ tvl: 12_750_000, ethereum: 12_750_000 }),
    current: baseline({ tvl: 13_500_000, ethereum: 13_500_000 }),
    adapterPath: 'projects/aave/v3.js',
  });
  assert.match(md, /TVL diff for `projects\/aave\/v3.js`/);
  assert.match(md, /\| \*\*total\*\* \| \$12.75M \| \$13.50M \| \+\$750.00k \| \+5.88% \|/);
  assert.match(md, /\| ethereum \| \$12.75M \| \$13.50M \| \+\$750.00k \| \+5.88% \|/);
});

test('computeDiff: marks added and removed chains', () => {
  const md = computeDiff({
    baseline: baseline({ tvl: 13_000_000, ethereum: 12_000_000, optimism: 1_000_000 }),
    current: baseline({ tvl: 12_400_000, ethereum: 12_000_000, polygon: 400_000 }),
    adapterPath: 'p',
  });
  assert.match(md, /\| polygon \| — \| \$400.00k \| \+\$400.00k \| new \|/);
  assert.match(md, /\| optimism \| \$1.00M \| — \| -\$1.00M \| removed \|/);
});

test('computeDiff: includes capture metadata footer when present', () => {
  const md = computeDiff({
    baseline: baseline({ tvl: 1_000_000 }, { capturedAt: '2026-04-26T14:32:00Z', fileSha: 'abcdef1234567890' }),
    current: baseline({ tvl: 1_100_000 }),
    adapterPath: 'p',
  });
  assert.match(md, /Baseline captured 2026-04-26T14:32:00Z from main@`abcdef1`/);
});

test('computeDiff: collapses ≥3 quiet chains; significant + added/removed always above the fold', () => {
  const baselineTotals = { tvl: 50_000_000, ethereum: 50_000_000 };
  const currentTotals = { tvl: 50_400_000, ethereum: 50_500_000, polygon: 400_000 };
  for (let i = 0; i < 4; i++) {
    baselineTotals[`q${i}`] = 5_000_000;
    currentTotals[`q${i}`] = 5_000_500;
  }
  const md = computeDiff({
    baseline: baseline(baselineTotals),
    current: baseline(currentTotals),
    adapterPath: 'p',
  });
  const aboveFold = md.split('<details>')[0];
  assert.match(aboveFold, /\| ethereum \|.*\+1.00% \|/);
  assert.match(aboveFold, /\| polygon \|.*new \|/);
  assert.match(aboveFold, /_4 other chains_.*_no significant change_/);
  assert.match(md, /<details><summary>Full per-chain table<\/summary>/);
  for (let i = 0; i < 4; i++) assert.match(md, new RegExp(`\\| q${i} \\|`));
});

test('computeDiff: does not collapse when fewer than 3 quiet rows', () => {
  const md = computeDiff({
    baseline: baseline({ tvl: 30_000_000, a: 10_000_000, b: 10_000_000 }),
    current: baseline({ tvl: 30_000_300, a: 10_000_100, b: 10_000_200 }),
    adapterPath: 'p',
  });
  assert.doesNotMatch(md, /other chains/);
  assert.doesNotMatch(md, /<details><summary>Full per-chain table/);
  assert.match(md, /\| a \|/);
  assert.match(md, /\| b \|/);
});

test('computeDiff: zero-delta shows $0 / 0%', () => {
  const md = computeDiff({
    baseline: baseline({ tvl: 1_000_000, ethereum: 1_000_000 }),
    current: baseline({ tvl: 1_000_000, ethereum: 1_000_000 }),
    adapterPath: 'p',
  });
  assert.match(md, /\| \*\*total\*\* \| \$1.00M \| \$1.00M \| \$0 \| 0% \|/);
});
