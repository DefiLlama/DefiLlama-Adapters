const { uniTvlExport } = require("../helper/calculateUniTvl");

const factory = "0xfe33b03a49a1fcd095a8434dd625c2d2735e84b8";
const masterChef = "0xf046e84439813bb0a26fb26944001c7bb4490771";
const stakingContract = "0xaa2c3396cc6b3dc7b857e6bf1c30eb9717066366";

const GMI = "0x8750f5651af49950b5419928fecefca7c82141e3";

const staking = async (api) => {
  const bal = await api.call({  abi: "uint256:balanceOf", target: stakingContract})
  api.add(GMI, bal)
  return api.sumTokens({ owner: masterChef, tokens: [GMI] })
};

module.exports = {
  harmony: {
    staking,
    tvl: uniTvlExport(factory, 'harmony', true),
  },
  methodology: "Counts liquidity on the Farms through Factory Contract, and counts Treasury as it is determined by bonding of assets. Staking refers to the staked GMI tokens",
};
