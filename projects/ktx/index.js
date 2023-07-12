const { staking } = require("../helper/staking");
const { gmxExports } = require("../helper/gmx");

const bscVault = "0xd98b46C6c4D3DBc6a9Cc965F385BDDDf7a660856";
const bscStaking = "0x5d1459517ab9FfD60f8aDECdD497ac94DD62d3FD";
const bscKTC = "0x545356d4d69d8cD1213Ee7e339867574738751CA";

module.exports = {
  bsc: {
    staking: staking(bscStaking, bscKTC, "bsc"),
    tvl: gmxExports({ vault: bscVault }),
  },
};
