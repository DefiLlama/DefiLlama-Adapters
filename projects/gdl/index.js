const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js')

// avax addresses below.
const GDL_USD_POOL = '0x3CE2B891071054ee10d4b5eD5a9446f9016F90d8';
const USDT = '0xde3a24028580884448a5397872046a019649b084';
const zUSDT = '0x650cecafe61f3f65edd21efacca18cc905eef0b7';

const GDL_DAI_POOL = '0x9D43f28C5Fce24D0c8B653E5c5859E0421Af7783';
const DAI = '0xba7deebbfc5fa1100fb055a87773e1e99cd3507a';
const zDAI = '0x12f108e6138d4a9c58511e042399cf8f90d5673f';

const GDL_ETH_POOL = '0xed986f982269e0319F710EC270875dE2b2A443d2';
const ETH = '0xf20d962a6c8f70c731bd838a3a388d7d48fa6e15';
const zETH = '0xf6f3eea905ac1da6f6dd37d06810c6fcb0ef5183';

const GDL_POOL = '0x34C8712Cc527a8E6834787Bd9e3AD4F2537B0f50';
const GDL = '0xd606199557c8ab6f4cc70bd03facc96ca576f142';

async function balanceOf(owner, target, block) {
  const chain = 'avax';
  let decimals = (await sdk.api.erc20.decimals(target, chain)).output;
  let balance = (await sdk.api.erc20.balanceOf({
    owner,
    target,
    block,
    chain,
  })).output;
  return Number(balance)/(10**decimals);
}

async function poolBalance(owner, targets, block) {
  let calls = await Promise.all(targets.map(async (target) => {
    return balanceOf(owner, target, block);
  }));
  let sum = calls.reduce((s, a) => s+a, 0);
  return sum;
}

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks['avax'];
  let balances = {};
  balances['tether'] = await poolBalance(GDL_USD_POOL, [USDT, zUSDT], block);
  balances['dai'] = await poolBalance(GDL_DAI_POOL, [DAI, zDAI], block);
  balances['ethereum'] = await poolBalance(GDL_ETH_POOL, [ETH, zETH], block);
  balances['gondola-finance'] = await poolBalance(GDL_POOL, [GDL], block);
  return balances;
}

module.exports = {
  avalanche:{
    tvl,
  },
  tvl,
};
