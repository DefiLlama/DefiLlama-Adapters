const { sumTokens2 } = require('../helper/unwrapLPs')

// fundex Asset Address
const Asset_P01_sUSD = "0x073785973E05d8Ce86351197B2Be8c14EdA40b7D";
const Asset_P01_DAI = "0xFD17Fcb581C6D9bBCa1ce80d19064bba0C3a72fE";
const Asset_P01_USDC = "0xf2819D706d94E13945B4898f44798a25451a48f6";
const Asset_P01_USDT = "0x7b5B4c5e381c7Dc116BF9dA8dDd1c96a3bd6C1cb";

// underlyingToken Address
const sUSD = "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9";
const DAI = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1";
const USDC = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607";
const USDT = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58";

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const chain = 'optimism'
  const block = chainBlocks["optimism"];
  return sumTokens2({ chain, block, tokensAndOwners: [
    [sUSD, Asset_P01_sUSD],
    [DAI, Asset_P01_DAI],
    [USDC, Asset_P01_USDC],
    [USDT, Asset_P01_USDT],
  ]})
}

module.exports = {
  optimism: {
    tvl,
  },
};
