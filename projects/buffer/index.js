const { staking } = require("../helper/staking");
const { sumTokens2, nullAddress, } = require("../helper/unwrapLPs");

const tokens = {
  IBFR: "0xa296aD1C47FE6bDC133f39555C1D1177BD51fBc5",
  BFR: "0x1A5B0aaF478bf1FDA7b934c76E7692D722982a6D",
  USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
};

const contracts = {
  ARBI_POOL: "0x37Cdbe3063002383B2018240bdAFE05127d36c3C",
  ARBI_POOL_V2: "0x4d338bc1a2380752736718f49bd45d9a040fdff8",
  ARBI_STAKING: "0x173817F33f1C09bCb0df436c2f327B9504d6e067",
  BSC_STAKING: "0xE6C2cDD466Eb1Fa6bDFDb8af1BD072d4A57734C2",
  BSC_POOL: "0x7338ee5535F1E0f1a210a6Ef6dB34f5357EB9860",
}

module.exports = {
  methodology: `Uniswap pool / USDC vault that acts as counterparty to all trades placed on the platform. Staking BFR for revenue share. No staking has any double counting`,
  bsc: {
    staking: staking(contracts.BSC_STAKING, tokens.IBFR, 'bsc'),
    tvl: async (_, _b, {bsc: block}) => sumTokens2({ chain: 'bsc', block, tokens: [nullAddress], owner: contracts.BSC_POOL}),
  },
  arbitrum: {
    staking: staking(contracts.ARBI_STAKING, tokens.BFR, 'arbitrum'),
    tvl: async (_, _b, {arbitrum: block}) => sumTokens2({ chain: 'arbitrum', block, tokens: [tokens.USDC], owners: [contracts.ARBI_POOL, contracts.ARBI_POOL_V2]}),
  },
  hallmarks: [
    [Math.floor(new Date('2022-09-29')/1e3), 'Migrate to Arbitrum'],
    [Math.floor(new Date('2022-10-26')/1e3), 'Shifted to POL pool'],
  ],
};
