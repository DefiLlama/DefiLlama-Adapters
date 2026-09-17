const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../projects/vfat/index.js'), 'utf8');
const now = Date.UTC(2026, 8, 17, 13, 31);
// Chain IDs from the public endpoint, independent of the adapter exports.
const ids = [1, 10, 25, 40, 56, 130, 137, 143, 146, 252, 369, 480, 677, 999,
  1135, 1750, 1868, 3338, 4217, 4326, 4663, 5000, 5042, 7000, 8453, 9745,
  34443, 42161, 42220, 42793, 43111, 43114, 57073, 59144, 80094, 534352, 747474];

function snapshot() {
  const chainStats = ids.map(chainId => ({ chainId, tvl: chainId === 1750 ? 0 : chainId + 0.25 }));
  return {
    complete: true,
    generatedAt: new Date(now).toISOString(),
    expectedChainIds: [...ids],
    chainStats,
    tvl: chainStats.reduce((sum, row) => sum + row.tvl, 0),
  };
}

function load(data, error) {
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module,
    Date: class extends Date { static now() { return now; } },
    require: name => {
      assert.equal(name, '../helper/http');
      return { getCache: async url => {
        assert.equal(url, 'https://api.vfat.io/v4/sickle-stats');
        if (error) throw error;
        return data;
      } };
    },
  });
  return module.exports;
}

async function value(adapter, chain, timestamp = now / 1000) {
  let result;
  await adapter[chain].tvl({ timestamp, addUSDValue: amount => { result = amount; } });
  return result;
}

test('reports every current chain exactly once, including the previously omitted TVL', async () => {
  const data = snapshot();
  const adapter = load(data);
  const names = Object.keys(adapter).filter(name => adapter[name]?.tvl);
  assert.equal(names.length, 37);
  const amounts = await Promise.all(names.map(name => value(adapter, name)));
  assert.deepEqual(amounts.sort((a, b) => a - b), data.chainStats.map(row => row.tvl).sort((a, b) => a - b));
  assert.equal(amounts.reduce((sum, amount) => sum + amount, 0), data.tvl);
  for (const [chain, chainId] of [['robinhood', 4663], ['hyperliquid', 999], ['monad', 143], ['arc', 5042], ['telos', 40]])
    assert.equal(await value(adapter, chain), chainId + 0.25);
  assert.equal(await value(adapter, 'metall2'), 0, 'an explicitly reported zero is valid');
  assert.equal(adapter.timetravel, false);
});

test('does not use the current snapshot to refill historical TVL', async () => {
  await assert.rejects(value(load(snapshot()), 'base', now / 1000 - 86400), /historical balances/);
});

test('allows publication lag within the two-hour bound', async () => {
  const data = snapshot();
  data.generatedAt = new Date(now - 2 * 3600000).toISOString();
  assert.equal(await value(load(data), 'base'), 8453.25);
});

const invalid = {
  'empty cache response': () => ({ chainStats: [] }),
  'incomplete publication': data => { data.complete = false; },
  'missing publication time': data => { delete data.generatedAt; },
  'invalid publication time': data => { data.generatedAt = 'invalid'; },
  'stale publication': data => { data.generatedAt = new Date(now - 2 * 3600000 - 1).toISOString(); },
  'future publication': data => { data.generatedAt = new Date(now + 5 * 60000 + 1).toISOString(); },
  'missing chain': data => { data.chainStats.pop(); },
  'duplicate chain': data => { data.chainStats.push(data.chainStats[0]); },
  'unexpected chain': data => { data.chainStats[0].chainId = 9999999; },
  'new chain without an export': data => {
    data.expectedChainIds.push(9999999);
    data.chainStats.push({ chainId: 9999999, tvl: 1 });
    data.tvl += 1;
  },
  'duplicate expected chain': data => { data.expectedChainIds.push(1); },
  'missing expected chain': data => { data.expectedChainIds.pop(); },
  'missing coverage metadata': data => { delete data.expectedChainIds; },
  'null chain row': data => { data.chainStats[0] = null; },
  'null TVL': data => { data.chainStats[0].tvl = null; },
  'numeric string TVL': data => { data.chainStats[0].tvl = '1'; },
  'negative TVL': data => { data.chainStats[0].tvl = -1; },
  'NaN TVL': data => { data.chainStats[0].tvl = NaN; },
  'infinite TVL': data => { data.chainStats[0].tvl = Infinity; },
  'null total': data => { data.tvl = null; },
  'mismatched total': data => { data.tvl += 1; },
};

for (const [name, change] of Object.entries(invalid)) {
  test(`rejects ${name} instead of publishing a partial total or zero`, async () => {
    const data = snapshot();
    const changed = change(data) || data;
    await assert.rejects(value(load(changed), 'base'), /vfat/);
  });
}

test('propagates HTTP failures', async () => {
  await assert.rejects(value(load(null, new Error('HTTP 503')), 'base'), /HTTP 503/);
});
