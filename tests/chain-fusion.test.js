const assert = require('node:assert/strict');
const { test } = require('node:test');
const sdk = require('@defillama/sdk');
const rpc = require('@defillama/sdk/build/chains/rpc');
const http = require('../projects/helper/http');

const ledger = 'mxzaz-hqaaa-aaaar-qaada-cai';
const icp = sdk.chains.icp;

function loadAdapter(t, supply, decimals = 8) {
  t.mock.method(http, 'get', async () => {
    throw new Error('The TVL must not depend on the dashboard indexer');
  });
  t.mock.method(rpc, 'httpPost', async (urls, body) => {
    assert.ok(urls.every(url => url.endsWith(`/api/v2/canister/${ledger}/query`)));
    const { content } = icp.decodeCbor(body);
    assert.equal(icp.principalBytesToText(content.canister_id), ledger);
    const replies = {
      icrc1_total_supply: { type: 'nat', value: supply },
      icrc1_decimals: { type: 'nat8', value: decimals },
    };
    assert.ok(replies[content.method_name], 'Only supply and decimals should be queried');
    return icp.encodeCbor({
      status: 'replied',
      reply: { arg: icp.encodeCandid([replies[content.method_name]]) },
    });
  });
  const path = require.resolve('../projects/chain-fusion');
  delete require.cache[path];
  return require(path);
}

const cases = [
  { name: 'preserves one satoshi through the real SDK', supply: '1', expected: 0.00000001 },
  { name: 'preserves the observed ledger supply', supply: '22982677400', expected: 229.826774 },
  { name: 'preserves eight decimals near the Bitcoin supply limit', supply: '2099999999999999', expected: 20999999.99999999 },
  { name: 'uses the ledger decimals instead of assuming a scale', supply: '1234567', decimals: 6, expected: 1.234567 },
  { name: 'accepts a verified zero supply', supply: '0', expected: 0 },
];

for (const { name, supply, decimals, expected } of cases) {
  test(name, async t => {
    const adapter = loadAdapter(t, supply, decimals);
    const api = new sdk.ChainApi({ chain: 'bitcoin' });
    await adapter.bitcoin.tvl(api);
    const expectedBalances = expected === 0 ? {} : { 'coingecko:bitcoin': expected };
    assert.deepEqual(api.getBalances(), expectedBalances);
  });
}

test('propagates a canister rejection instead of reporting zero', async t => {
  const adapter = loadAdapter(t, '1');
  t.mock.method(rpc, 'httpPost', async () => icp.encodeCbor({
    status: 'rejected', reject_code: 5, reject_message: 'Ledger unavailable',
  }));
  const api = new sdk.ChainApi({ chain: 'bitcoin' });
  await assert.rejects(adapter.bitcoin.tvl(api), /Ledger unavailable/);
  assert.deepEqual(api.getBalances(), {});
});

test('rejects malformed ledger data instead of using a partial balance', async t => {
  const adapter = loadAdapter(t, '1');
  t.mock.method(rpc, 'httpPost', async () => icp.encodeCbor({
    status: 'replied', reply: { arg: Buffer.from('invalid') },
  }));
  const api = new sdk.ChainApi({ chain: 'bitcoin' });
  await assert.rejects(adapter.bitcoin.tvl(api), /Invalid Candid payload/);
  assert.deepEqual(api.getBalances(), {});
});
