const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const USDT = ADDRESSES.bsc.USDT;

const publicPool = "0x65081C21228dc943f47b1Cdb394Eb8db022bc744";
const privatePool = "0xFa4e13EfAf2C90D6Eaf5033A4f3cB189ee4eF189";
const pools = [publicPool, privatePool];

async function tvl(timestamp, _, { bsc: block }) {
  return sumTokens2({ chain: 'bsc', block, owners: pools, tokens: [USDT]})
}

module.exports = {
  methodology: 'Dual liquidity pool is an innovation by Shield that allows the private pool to hedge the market making risk, while the low-risk public pool can accommodate liquidity to guarantee abundant liquidity on the market. TVL on Shield should combine liquidity from both public pool and private pool.',
  start: 11160281, // Sep-23-2021 08:37:45 AM +UTC
  bsc: {
    tvl,
  },
}
