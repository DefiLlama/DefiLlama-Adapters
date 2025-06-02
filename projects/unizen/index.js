const { pool2 } = require("../helper/pool2");

const stakingContract = "0xb202CCbeBB4C472657f16F30bF277d3BE7F4781a";
const ZCX = "0xc52c326331e9ce41f04484d3b5e5648158028804";
const WETH_ZCX_UNIV2 = "0x797E1Dc0738f2F047d7E0Dd185e41A35F87c5618";

const staking = async (api) => {
  const { totalValueLocked } = await api.call({ abi: "function stakeableTokens(address) view returns (uint256 totalValueLocked, uint256 weight, bool active)", target: stakingContract, params: ZCX })
  api.add(ZCX, totalValueLocked)
};

module.exports = {
  ethereum: {
    staking: staking,
    pool2: pool2(stakingContract, WETH_ZCX_UNIV2),
    tvl: () => ({}),
  },
  methodology:
    "Counts liquidity as Staking and Pool2 only",
};
