const { getUniTVL } = require('../helper/unknownTokens');
const { sumTokensExport } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const dMUTE_staking_contract = "0xd9Ee4c1e04059D4B0dd02b747282511bEE4E5fB5"
const MUTE = "0x0e97C7a0F8B2C9885C8ac9fC6136e829CbC21d42"

async function stakingTVL(timestamp, chain, chainBlocks) {

  let { output: balance } = await sdk.api.erc20.balanceOf({
      target: MUTE,
      owner: dMUTE_staking_contract,
      block: chainBlocks.era,
      chain: "era"
  });

  let staked_MUTE = balance / 10**18  

  return {mute:staked_MUTE};
}

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({ factory: '0x40be1cba6c5b47cdf9da7f963b6f761f4c60627d', useDefaultCoreAssets: true, hasStablePools: true, stablePoolSymbol: 'sMLP' }),
    staking: stakingTVL
  },
  methodology: "Counts liquidity in pools and MUTE token in the dMUTE contract",
};