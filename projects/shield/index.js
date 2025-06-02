const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const publicPool = "0x65081C21228dc943f47b1Cdb394Eb8db022bc744";
const privatePool = "0xFa4e13EfAf2C90D6Eaf5033A4f3cB189ee4eF189";
const pools = [publicPool, privatePool];

module.exports = {
  methodology: 'Dual liquidity pool is an innovation by Shield that allows the private pool to hedge the market making risk, while the low-risk public pool can accommodate liquidity to guarantee abundant liquidity on the market. TVL on Shield should combine liquidity from both public pool and private pool.',
  bsc: {
    tvl: sumTokensExport({ owners: pools, token: ADDRESSES.bsc.USDT}),
  },
}
