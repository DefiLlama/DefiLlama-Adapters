const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");

const SpartacusStakings = "0x9863056B4Bdb32160A70107a6797dD06B56E8137";
const SPA = "0x5602df4A94eB6C680190ACCFA2A475621E0ddBdc";

const treasuryAddresses = ["0x8CFA87aD11e69E071c40D58d2d1a01F862aE01a8"];
const DAI = "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E";
const SPA_DAI_SLP = "0xfa5a5f0bc990be1d095c5385fff6516f6e03c0a7";

/*** Bonds TVL Portion (Treasury) ***/
async function ethTvl(timestamp, chainBlocks) {
  const balances = {};

  const transformAddress = await transformFantomAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [DAI, false],
      [SPA_DAI_SLP, true],
    ],
    treasuryAddresses,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
}

module.exports = {
  ethereum: {
    staking: staking(SpartacusStakings, SPA, "fantom"),
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "Counts tvl on Bonds of DAI and DAI spLP (SPA-DAI) through Treasury Contract",
};
