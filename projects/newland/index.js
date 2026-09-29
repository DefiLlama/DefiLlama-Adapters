const abi = {
    "poolInfoA": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accHptPerShare, uint256 miningChefPid, uint256 lpBalance, uint256 accMiningPerShare, uint256 totalLPReinvest, uint256 totalPoints, address strategyLink, uint256 sid, uint256 mdxPid, bool paused)",
    "poolInfoB": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accHptPerShare, uint256 mdxChefPid, uint256 lpBalance, uint256 accMdxPerShare)",
    "poolLength": "uint256:poolLength"
  };const { sumTokens2, } = require("../helper/unwrapLPs");
const SushiStakingChef_Ethereum = "0x0503866eD9F304Ec564F145d22994F7f11838596";

const ethTvl = async (api) => {
  const info = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfoB, target: SushiStakingChef_Ethereum})
  info.map(i => api.add(i.lpToken, i.lpBalance))
  return sumTokens2({ api, resolveLP: true, })
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  heco: {
    tvl:  () => ({}),
  },
  methodology: `We count TVL on the pools (LP tokens), that are staking in other protocolos as Booster, Mdex and Lava on Heco Network
   and SushiSwap  on Ethereum Network,threw their correspondent MasterChef contracts; and Treasury part separated`,
};
