const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const assets = require('../projects/helper/coreAssets.json').nibiru;
const token = '0x357c97796aA8e2A6b5A64b1Fc19d5baB9668E190';
const proxy = '0x25589C8071fa10B7a8c62CdCA7035c539242A774';
const proxyBankOwner = 'nibi1y4vfeqr3lggt02xx9nw2wq6u2wfy9fm5gllrzm';
const perp = 'nibi1configuredperp';

function fixture(options = {}) {
  const reserves = {
    usdc_denom: `erc20/${token}`,
    perp_bank_balance: '1000001',
    vaults: [
      { slp_addr: 'nibi1configuredvaulta', bank_balance: '2000002' },
      { slp_addr: 'nibi1configuredvaultb', bank_balance: '3000003' },
    ],
    // These are ownership ledgers and display fields, not additional custody.
    sai_reserve: '999999999999',
    pending_gov_fees: '999999999999',
    perp_bank_balance_usd: '999999999999',
    issues: [],
    ...options.reserves,
  };
  const added = [];
  const queried = [];
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../projects/sai/index.js'), 'utf8'), {
    module,
    Buffer,
    require(name) {
      assert.equal(name, '../helper/coreAssets'); // No LCD/Cosmos helper dependency.
      return { nibiru: assets };
    },
  });
  const api = {
    async call(args) {
      queried.push(args);
      if (args.abi === options.failAbi) throw new Error('RPC failure');
      if (args.abi === 'function perpContractAddress() view returns (string)') {
        assert.equal(args.target, proxy);
        return perp;
      }
      if (args.abi === 'function query(string contractAddr, bytes req) view returns (bytes)') {
        assert.equal(args.target, '0x0000000000000000000000000000000000000802');
        assert.equal(args.params[0], perp);
        assert.deepEqual(JSON.parse(Buffer.from(args.params[1].slice(2), 'hex').toString()), { get_sai_reserves: {} });
        return `0x${Buffer.from(JSON.stringify(reserves)).toString('hex')}`;
      }
      if (args.abi.startsWith('function bankBalance(')) {
        assert.equal(args.target, '0x0000000000000000000000000000000000000800');
        assert.deepEqual(Array.from(args.params), [proxy, `erc20/${token}`]);
        return [options.bank ?? '4000004', [proxy, proxyBankOwner]];
      }
      assert.equal(args.abi, 'function balanceOf(address account) view returns (uint256)');
      assert.equal(args.target, token);
      assert.deepEqual(Array.from(args.params), [proxy]);
      return Object.hasOwn(options, 'erc20') ? options.erc20 : '5000005';
    },
    add(asset, amount) { added.push([asset, amount]); },
  };
  return { adapter: module.exports, api, added, queried };
}

test('EVM-only reads discover Perp and multiple USDC vaults, counting raw custody once', async () => {
  const f = fixture();
  await f.adapter.nibiru.tvl(f.api);
  assert.equal(f.queried.length, 4);
  assert.equal(f.added.length, 5);
  assert.equal(f.added.reduce((sum, [, amount]) => sum + BigInt(amount), 0n), 15000015n);
  assert.ok(f.added.every(([asset]) => asset === token));
  assert.equal(assets.USDC, '0x0829F361A05D993d5CEb035cA6DF3446b060970b');
});

test('zero balances are valid and a changed configured vault needs no adapter address edit', async () => {
  const f = fixture({ reserves: { perp_bank_balance: '0', vaults: [{ slp_addr: 'nibi1replacementvault', bank_balance: '0' }] }, bank: '0', erc20: '0' });
  await f.adapter.nibiru.tvl(f.api);
  assert.equal(f.added.length, 4);
  assert.ok(f.added.every(([, amount]) => amount === '0'));
});

test('missing balances, wrong collateral, and partial reserves observations fail without partial TVL', async () => {
  for (const reserves of [
    { perp_bank_balance: undefined },
    { usdc_denom: 'tf/retired/ampNIBI' },
    { issues: [{ field: 'bank_balance', error: 'unavailable' }] },
    { issues: undefined },
    { vaults: undefined },
    { vaults: [{ slp_addr: 'nibi1vault' }] },
  ]) {
    const f = fixture({ reserves });
    await assert.rejects(f.adapter.nibiru.tvl(f.api));
    assert.equal(f.added.length, 0);
  }
});

test('vault owner aliases cannot double-count Perp, SaiEvm Bank, or another vault', async () => {
  for (const vaults of [
    [{ slp_addr: perp, bank_balance: '1' }],
    [{ slp_addr: proxyBankOwner, bank_balance: '1' }],
    [{ slp_addr: 'nibi1vault', bank_balance: '1' }, { slp_addr: 'nibi1vault', bank_balance: '1' }],
  ]) {
    const f = fixture({ reserves: { vaults } });
    await assert.rejects(f.adapter.nibiru.tvl(f.api), /duplicate/);
    assert.equal(f.added.length, 0);
  }
});

test('each EVM query failure rejects instead of reporting partial TVL', async () => {
  const abis = fixture();
  await abis.adapter.nibiru.tvl(abis.api);
  for (const { abi } of abis.queried) {
    const f = fixture({ failAbi: abi });
    await assert.rejects(f.adapter.nibiru.tvl(f.api), /RPC failure/);
    assert.equal(f.added.length, 0);
  }
});

test('invalid ERC20 responses reject before any balances are added', async () => {
  for (const erc20 of [null, undefined, '1.5', '-1', '', true]) {
    const f = fixture({ erc20 });
    await assert.rejects(f.adapter.nibiru.tvl(f.api), /Invalid Sai USDC balance/);
    assert.equal(f.added.length, 0);
  }
});
