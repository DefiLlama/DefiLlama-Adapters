const assert = require('node:assert/strict');
const { test, mock } = require('node:test');
const { PublicKey } = require('@solana/web3.js');
const sdk = require('@defillama/sdk');
const { getConnection } = require('../projects/helper/solana');
const http = require('../projects/helper/http');

// The unavailable indexer must not be required to compute staking balances.
mock.method(http, 'get', async () => { throw new Error('Orbit indexer unavailable'); });
const adapter = require('../projects/orbit-finance');

const CIPHER = 'Ciphern9cCXtms66s8Mm6wCFC27b2JProRQLYmiLMH3N';
const VAULT = '5wcWpUU7ciYie4jBxhNmDt53Ky1CfWh31v6M6HP1pUia';
const POOL = 'Fh7u35PsxFWBWNE5Pme2yffixJ5H7YocAymJHs6L73N';
const PROGRAM = 'STAKEvGqQTtzJZH6BWDcbpzXXn2BBerPAgQ3EGLN2GH';
// Mainnet StakePool Fh7u...L73N, observed on 2026-10-08.
// Layout: streamflow-finance/js-sdk@fb236fff, packages/staking/solana/descriptor/idl/stake_pool.json.
const POOL_DATA = 'eSLOFU9//xz/AK4nThFSyS+2iQ2yYvlZ28pQ2YmeYjG/AgzgHBhS0g45DiBxVa29OQpJ9PM7CxAGmsjvod5dGMXhCAnj0oN03/MOIHFVrb05Ckn08zsLEAaayO+h3l0YxeEICePSg3Tf8wDKmjsAAAAAAOh2SBcAAACAUQEAAAAAAIAz4QEAAAAAAElsRG/AXRkGuUviYXCGvtwgZVcmUfrJ5qHYYMGrc/fPJ9BycB2UF8ztMeevrFXe9fWbbBg7w2WJVuSBM0WiBUig187c2hoRAXHcrTo5rEE7tHA3CAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';

function stakePool(vault = VAULT, allocation = 296) {
  const data = Buffer.alloc(allocation);
  Buffer.from(POOL_DATA, 'base64').copy(data);
  new PublicKey(vault).toBuffer().copy(data, 139);
  return { pubkey: new PublicKey(POOL), account: { data, owner: new PublicKey(PROGRAM) } };
}

function discover(t, pools) {
  t.mock.method(getConnection(), 'getProgramAccounts', async (program, config) => {
    assert.equal(program.toBase58(), PROGRAM);
    assert.deepEqual(config.filters, [
      { memcmp: { offset: 0, bytes: 'MGAteRdkWBD' } },
      { memcmp: { offset: 10, bytes: CIPHER } },
    ]);
    return pools;
  });
}

function tokenAccount(amount) {
  const data = Buffer.alloc(165);
  new PublicKey(CIPHER).toBuffer().copy(data, 0);
  new PublicKey(POOL).toBuffer().copy(data, 32);
  data.writeBigUInt64LE(BigInt(amount), 64);
  data[108] = 1;
  return { data: [data.toString('base64'), 'base64'], owner: sdk.chains.svm.TOKEN_PROGRAM_ID };
}

function vaultBalances(t, vaults) {
  t.mock.method(sdk.chains.rpc, 'jsonRpc', async (method, params) => {
    assert.equal(method, 'getMultipleAccounts');
    assert.deepEqual(params[0], Object.keys(vaults));
    return { value: Object.values(vaults) };
  });
}

test('reads CIPHER staking custody without the indexer and preserves raw integer precision', async (t) => {
  discover(t, [stakePool()]);
  vaultBalances(t, { [VAULT]: tokenAccount('76872195951744928') });
  const api = new sdk.ChainApi({ chain: 'solana' });
  await adapter.solana.staking(api);
  assert.deepEqual(api.getBalances(), { [`solana:${CIPHER}`]: '76872195951744928' });
});

test('includes newly discovered pools and counts each vault once', async (t) => {
  const secondVault = new PublicKey(Buffer.alloc(32, 7)).toBase58();
  discover(t, [stakePool(), stakePool(secondVault), stakePool()]);
  vaultBalances(t, {
    [VAULT]: tokenAccount('9007199254740993'),
    [secondVault]: tokenAccount('9007199254740995'),
  });
  const api = new sdk.ChainApi({ chain: 'solana' });
  await adapter.solana.staking(api);
  assert.deepEqual(api.getBalances(), { [`solana:${CIPHER}`]: '18014398509481988' });
});

test('discovers stake pools without depending on reserved account space', async (t) => {
  discover(t, [stakePool(VAULT, 320)]);
  vaultBalances(t, { [VAULT]: tokenAccount('42') });
  const api = new sdk.ChainApi({ chain: 'solana' });
  await adapter.solana.staking(api);
  assert.deepEqual(api.getBalances(), { [`solana:${CIPHER}`]: '42' });
});

test('returns empty balances when no CIPHER stake pools exist', async (t) => {
  discover(t, []);
  t.mock.method(sdk.chains.rpc, 'jsonRpc', async () => { assert.fail('No vault RPC expected'); });
  const api = new sdk.ChainApi({ chain: 'solana' });
  await adapter.solana.staking(api);
  assert.deepEqual(api.getBalances(), {});
});

test('propagates discovery failures instead of reporting zero staking', async (t) => {
  t.mock.method(getConnection(), 'getProgramAccounts', async () => { throw new Error('Discovery failed'); });
  await assert.rejects(adapter.solana.staking(new sdk.ChainApi({ chain: 'solana' })), /Discovery failed/);
});

test('rejects a missing vault instead of returning a partial balance', async (t) => {
  discover(t, [stakePool()]);
  vaultBalances(t, { [VAULT]: null });
  await assert.rejects(adapter.solana.staking(new sdk.ChainApi({ chain: 'solana' })), /invalid token account/);
});

test('propagates vault RPC failures', async (t) => {
  discover(t, [stakePool()]);
  t.mock.method(sdk.chains.rpc, 'jsonRpc', async () => { throw new Error('Vault RPC failed'); });
  await assert.rejects(adapter.solana.staking(new sdk.ChainApi({ chain: 'solana' })), /Vault RPC failed/);
});
