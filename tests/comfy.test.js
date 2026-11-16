const assert = require('node:assert/strict');
const { test } = require('node:test');
const { ChainApi } = require('@defillama/sdk');
const logReader = require('../projects/helper/cache/getLogs');

const native = '0x0000000000000000000000000000000000000000';
const token = '0xd4d54bd7379e799417563b1bb42426c9bd4ccb2a';
const manager = '0xaabd31f24914b48daea998e69683225e289d08b0';
const vault = '0x5809c1ff809cfc6fca8518016cdffa8339ba2a3a';
const deploymentBlock = 45552804;

function loadTvl(t, getLogs) {
  t.mock.method(logReader, 'getLogs2', getLogs);
  delete require.cache[require.resolve('../projects/comfy')];
  return require('../projects/comfy')['0g'].tvl;
}

function apiAt(t, block, balances) {
  const api = new ChainApi({ chain: '0g', block });
  t.mock.method(api, 'multiCall', async ({ target, abi, calls }) => {
    assert.equal(api.block, block);
    return calls.map(call => {
      if (abi.includes('reservesOfApp')) {
        assert.equal(target, vault);
        assert.equal(call.params[0], manager);
        return balances[call.params[1]].reserve;
      }
      assert.match(abi, /protocolFeesAccrued/);
      assert.equal(target, manager);
      return balances[call.params[0]].protocolFee;
    });
  });
  return api;
}

test('counts each currency once and excludes protocol fees from manager reserves', async t => {
  const tvl = loadTvl(t, async () => [
    { currency0: native, currency1: token },
    { currency0: native, currency1: token.toUpperCase() },
  ]);
  const api = apiAt(t, 50412442, {
    [native]: { reserve: '2834504763597105490203446', protocolFee: '5401678209638639782148' },
    [token]: { reserve: '24515176771', protocolFee: '1018999' },
  });
  await tvl(api);
  assert.deepEqual(api.getBalances(), {
    [`0g:${native}`]: '2829103085387466850421298',
    [`0g:${token}`]: '24514157772',
  });
});

test('discovers and reads reserves at the requested historical block', async t => {
  const block = 45608214;
  const tvl = loadTvl(t, async options => {
    assert.equal(options.api.block, block);
    assert.equal(options.toBlock, block);
    assert.equal(options.target, manager);
    assert.equal(options.fromBlock, deploymentBlock);
    return [{ currency0: native, currency1: token }];
  });
  const api = apiAt(t, block, {
    [native]: { reserve: '1000', protocolFee: '25' },
    [token]: { reserve: '1000000', protocolFee: '1000' },
  });
  await tvl(api);
  assert.equal(api.block, block);
  assert.deepEqual(api.getBalances(), { [`0g:${native}`]: '975', [`0g:${token}`]: '999000' });
});

test('returns no balances before the manager deployment', async t => {
  const tvl = loadTvl(t, async () => assert.fail('must not query undeployed contracts'));
  const api = apiAt(t, deploymentBlock - 1, {});
  await tvl(api);
  assert.deepEqual(api.getBalances(), {});
  assert.equal(api.multiCall.mock.callCount(), 0);
});

test('returns no balances when no pool has been initialized', async t => {
  const tvl = loadTvl(t, async () => []);
  const api = apiAt(t, deploymentBlock, {});
  await tvl(api);
  assert.deepEqual(api.getBalances(), {});
  assert.equal(api.multiCall.mock.callCount(), 0);
});

test('rejects an inconsistent protocol fee balance', async t => {
  const tvl = loadTvl(t, async () => [{ currency0: native, currency1: token }]);
  const api = apiAt(t, 50412442, {
    [native]: { reserve: '100', protocolFee: '101' },
    [token]: { reserve: '1000', protocolFee: '0' },
  });
  await assert.rejects(tvl(api), /Protocol fees exceed manager reserves/);
  assert.deepEqual(api.getBalances(), {});
});

test('propagates failed reserve reads', async t => {
  const tvl = loadTvl(t, async () => [{ currency0: native, currency1: token }]);
  const api = new ChainApi({ chain: '0g', block: 50412442 });
  const failure = new Error('archive read unavailable');
  t.mock.method(api, 'multiCall', async () => { throw failure; });
  await assert.rejects(tvl(api), failure);
  assert.deepEqual(api.getBalances(), {});
});

test('rejects missing reserve results instead of reporting zero', async t => {
  const tvl = loadTvl(t, async () => [{ currency0: native, currency1: token }]);
  const api = apiAt(t, 50412442, {
    [native]: { reserve: null, protocolFee: '0' },
    [token]: { reserve: '1000', protocolFee: '0' },
  });
  await assert.rejects(tvl(api), TypeError);
  assert.deepEqual(api.getBalances(), {});
});

test('includes currencies initialized at the snapshot block with a populated helper cache', async t => {
  const { Interface, ZeroHash } = require('ethers');
  const cache = require('../projects/helper/cache');
  const sdkLogs = require('@defillama/sdk/build/util/logs');
  const helperPath = require.resolve('../projects/helper/cache/getLogs');
  const previousHelper = require.cache[helperPath];
  const block = 50110860;
  const futureToken = '0x1111111111111111111111111111111111111111';
  const iface = new Interface([
    'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, address hooks, uint24 fee, bytes32 parameters, uint160 sqrtPriceX96, int24 tick)',
  ]);
  const logs = [token, futureToken].map((currency, index) => ({
    ...iface.encodeEventLog(iface.getEvent('Initialize'), [
      `0x${String(index + 1).repeat(64)}`, native, currency, native, 500, ZeroHash, 2n ** 96n, 0,
    ]),
    transactionHash: `0x${String(index + 3).repeat(64)}`,
    logIndex: 0,
    blockNumber: block + index,
  }));
  t.mock.method(cache, 'getCache', async () => ({ fromBlock: deploymentBlock, toBlock: block + 1, logs }));
  t.mock.method(cache, 'setCache', async () => {});
  t.mock.method(sdkLogs, 'getLogs', async ({ fromBlock, toBlock }) =>
    logs.filter(log => log.blockNumber >= fromBlock && log.blockNumber <= toBlock));
  delete require.cache[helperPath];
  delete require.cache[require.resolve('../projects/comfy')];
  t.after(() => {
    require.cache[helperPath] = previousHelper;
    delete require.cache[require.resolve('../projects/comfy')];
  });
  const tvl = require('../projects/comfy')['0g'].tvl;
  const api = apiAt(t, block, {
    [native]: { reserve: '1000', protocolFee: '25' },
    [token]: { reserve: '49990000000', protocolFee: '0' },
  });
  await tvl(api);
  assert.deepEqual(api.getBalances(), {
    [`0g:${native}`]: '975',
    [`0g:${token}`]: '49990000000',
  });
});
