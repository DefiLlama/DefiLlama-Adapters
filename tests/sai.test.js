const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const assets = require('../projects/helper/coreAssets.json').nibiru;
const token = '0x357c97796aA8e2A6b5A64b1Fc19d5baB9668E190';
const denom = `erc20/${token}`;
const bankOwners = [
  'nibi1ntmw2dfvd0qnw5fnwdu9pev2hsnqfdj9ny9n0nzh2a5u8v0scflq930mph',
  'nibi193m2a00pmdsvkcvugrfewqzhtq6k0srkjzvxp2sk357vlpspx5vqxu8d7p',
  'nibi1y4vfeqr3lggt02xx9nw2wq6u2wfy9fm5gllrzm',
];

function fixture({ bank = ['1000001', '2000002', '3000003'], erc20 = '4000004', bankError, rpcError } = {}) {
  const added = [];
  const queried = [];
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../projects/sai/index.js'), 'utf8'), {
    module,
    require(name) {
      if (name === '../helper/coreAssets') return { nibiru: assets };
      assert.equal(name, '../helper/chain/cosmos');
      return { async getBalance2(args) {
        queried.push(args);
        if (bankError) throw bankError;
        const amount = bank[bankOwners.indexOf(args.owner)];
        return amount === undefined ? {} : { [denom.replaceAll('/', ':')]: amount };
      } };
    },
  });
  const api = {
    chain: 'nibiru',
    async call(args) {
      assert.equal(args.abi, 'erc20:balanceOf');
      assert.equal(args.target, token);
      assert.equal(args.params, '0x25589C8071fa10B7a8c62CdCA7035c539242A774');
      if (rpcError) throw rpcError;
      return erc20;
    },
    add(asset, amount) { added.push([asset, amount]); },
  };
  return { adapter: module.exports, api, added, queried };
}

test('counts only distinct canonical custody in raw six-decimal units', async () => {
  const f = fixture();
  await f.adapter.nibiru.tvl(f.api);
  assert.equal(f.added.length, 4);
  assert.equal(f.added.reduce((sum, [, amount]) => sum + BigInt(amount), 0n), 10000010n);
  assert.ok(f.added.every(([asset]) => asset === token));
  assert.deepEqual(f.queried.map(q => q.owner).sort(), [...bankOwners].sort());
  assert.equal(new Set(f.queried.map(q => q.owner)).size, 3);
  for (const query of f.queried) {
    assert.equal(query.chain, 'nibiru');
    assert.deepEqual(Array.from(query.tokens), [denom]);
  }
  assert.equal(assets.USDC, '0x0829F361A05D993d5CEb035cA6DF3446b060970b');
  assert.equal(f.adapter.timetravel, false);
});

test('a successfully read account without the canonical denom contributes zero', async () => {
  const f = fixture({ bank: [], erc20: '0' });
  await f.adapter.nibiru.tvl(f.api);
  assert.ok(f.added.every(([, amount]) => BigInt(amount) === 0n));
});

test('REST and RPC errors reject the adapter instead of returning partial TVL', async () => {
  for (const options of [{ bankError: new Error('LCD unavailable') }, { rpcError: new Error('RPC unavailable') }]) {
    const f = fixture(options);
    await assert.rejects(f.adapter.nibiru.tvl(f.api), /unavailable/);
    assert.equal(f.added.length, 0);
  }
});

test('invalid balance responses fail visibly', async () => {
  for (const erc20 of [undefined, null, '1.25', '-1', '']) {
    const f = fixture();
    f.api.call = async () => erc20;
    await assert.rejects(f.adapter.nibiru.tvl(f.api), /Invalid Sai USDC balance/);
  }
});
