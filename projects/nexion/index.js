const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

// Nexion protocol addresses
const contracts = {
  NEONStaking: "0x00149EF1A0a41083bC3996d026a7c0f32fc5cb73",
  NEONStakingV2: "0xB4f064f8c0CB1118d1326Df6E74b05D6B12d0b2B",
  NEON: "0xF2Da3942616880E52e841E5C504B5A9Fba23FFF0",
  NEONFarm: "0xdF6ec9b93fa473Cb6772dc47326338ecBa374D39",
  OLDNEONFarm: "0x80020303898695b3Ab8017869B6158B49cD5B6CC",
};

const COLLATERALS = {
  DAI: ADDRESSES.pulse.DAI,
  WPLS: ADDRESSES.pulse.WPLS,
};

/**
 * Tracks farm deposits only. Lending TVL is handled by the separate
 * nexion-lending adapter (via DataCompressor) to avoid double-counting.
 */
async function tvl(api) {
  const farmOwners = [contracts.NEONFarm, contracts.OLDNEONFarm];
  const farmTokens = [COLLATERALS.DAI, COLLATERALS.WPLS, ADDRESSES.null];
  const tokensAndOwners = [];
  farmOwners.forEach(owner => {
    farmTokens.forEach(token => {
      tokensAndOwners.push([token, owner]);
    });
  });

  return sumTokens2({ api, tokensAndOwners, resolveLP: true });
}

module.exports = {
  methodology: "TVL is farm deposits. Lending TVL and borrowed are tracked separately in the nexion-lending adapter. Staking is NEON locked in staking contracts (V1 + V2).",
  pulse: {
    tvl,
    staking: async (api) => {
      return sumTokens2({
        api,
        tokensAndOwners: [
          [contracts.NEON, contracts.NEONStaking],
          [contracts.NEON, contracts.NEONStakingV2],
        ],
      });
    },
  },
};
