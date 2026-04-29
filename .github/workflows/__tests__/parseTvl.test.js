const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseTvl, parseHumanizedNumber } = require('../parseTvl');

test('parseHumanizedNumber: humanizeNumber output forms', () => {
  const cases = [
    ['12.34 M', 12_340_000],
    ['1.50 B', 1_500_000_000],
    ['2.00 T', 2_000_000_000_000],
    ['500.00 k', 500_000],
    ['123.45', 123.45],
    ['0.00', 0],
    ['-1.23 M', -1_230_000],
  ];
  for (const [input, expected] of cases) {
    assert.equal(parseHumanizedNumber(input), expected, `parse ${input}`);
  }
});

test('parseHumanizedNumber: returns null for unparseable input', () => {
  for (const input of ['', 'abc', '1.2.3', 'NaN', null, undefined]) {
    assert.equal(parseHumanizedNumber(input), null, `null for ${JSON.stringify(input)}`);
  }
});

test('parseTvl: throws on non-string input', () => {
  assert.throws(() => parseTvl(null), /must be a string/);
});

test('parseTvl: returns errored shape when no TVL marker present', () => {
  const result = parseTvl('preamble\n------ ERROR ------\nstack trace');
  assert.equal(result.errored, true);
  assert.match(result.errorTail, /stack trace/);
  assert.deepEqual(result.totals, {});
});

test('parseTvl: errored shape with no markers at all', () => {
  const result = parseTvl('nothing useful');
  assert.equal(result.errored, true);
  assert.equal(result.errorTail, null);
});

test('parseTvl: errored when both TVL and ERROR markers present', () => {
  const stdout = '------ TVL ------\nethereum 1.00 M\n------ ERROR ------\nboom';
  const result = parseTvl(stdout);
  assert.equal(result.errored, true);
  assert.match(result.errorTail, /boom/);
  assert.deepEqual(result.totals, {});
});

test('parseTvl: extracts totals from realistic stdout', () => {
  const stdout = [
    '--- ethereum ---',
    'USDC                       12.30 M',
    'Total: 12.30 M',
    '',
    '------ TVL ------',
    'ethereum                   12.75 M',
    'polygon                    3.00 M',
    '',
    'total                      15.75 M',
  ].join('\n');

  const result = parseTvl(stdout);
  assert.equal(result.errored, false);
  assert.equal(result.schema, 'tvl-baseline-v1');
  assert.deepEqual(result.totals, { tvl: 15_750_000, ethereum: 12_750_000, polygon: 3_000_000 });
});

test('parseTvl: tolerates blank lines and trailing whitespace', () => {
  const stdout = '\n\n------ TVL ------\n\nethereum                   1.00 M \n\ntotal                      1.00 M\n\n';
  assert.equal(parseTvl(stdout).totals.ethereum, 1_000_000);
});

test('parseTvl: ignores totals rows with unparseable values', () => {
  const stdout = '------ TVL ------\nweird   undefined\nethereum   1.00 M\ntotal   1.00 M\n';
  const result = parseTvl(stdout);
  assert.equal(result.totals.ethereum, 1_000_000);
  assert.equal(result.totals.weird, undefined);
});
