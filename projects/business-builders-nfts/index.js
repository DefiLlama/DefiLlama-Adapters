const { sumTokensExport } = require("../helper/unknownTokens");

const METER_FTB_CONTRACT = "0x6cfe9adad5215195c1aa9755daed29360e6ab986";
const METER_REWARDS_CONTRACT = "0x103ed6fb861a2651ff59f0852d3739c18d45cd9b";
const METER_FTB_MTRG_CONTRACT = "0x88cdb3e764dedcc2e3a1642957ebd513765b252a";

const POLYGON_FTB_CONTRACT = "0xF305012EA754252184f1071C86ae99fAc5B40320";
const POLYGON_REWARDS_CONTRACT = "0x0455e50b2822e6f3d8dc01246aca8378a8992466";
const POLYGON_FTB_MATIC_CONTRACT = "0x1Df39b565652eACa24dfB16A07dcfe4d7f8f02c3";

module.exports = {
  misrepresentedTokens: true,
  meter: {
    staking: sumTokensExport({ owner: METER_REWARDS_CONTRACT, tokens:[METER_FTB_CONTRACT,], useDefaultCoreAssets: true, lps: [METER_FTB_MTRG_CONTRACT] }),
  },
  polygon: {
    staking: sumTokensExport({ owner: POLYGON_REWARDS_CONTRACT, tokens:[POLYGON_FTB_CONTRACT,], useDefaultCoreAssets: true, lps: [POLYGON_FTB_MATIC_CONTRACT] }),
    tvl: () => 0,
  },
  methodology: `Staking: we include locked tokens on the rewards contracts as staking`,
};
