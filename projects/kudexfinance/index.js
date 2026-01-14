const abi = {
  "poolLength": "uint256:poolLength",
  "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accKudexPerShare, uint16 depositFeeBP, uint256 harvestInterval)"
}
const { sumTokens2, } = require("../helper/unwrapLPs");

const masterChefContract = "0x243e46d50130f346bede1d9548b41c49c6440872";

const kccTvl = async (api) => {
  const tokens = await api.fetchList({  lengthAbi: abi.poolLength , itemAbi: abi.poolInfo, target: masterChefContract, field: 'lpToken' })
  return sumTokens2({ api, tokens, owner: masterChefContract, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the farms (LP tokens) and pools(single tokens) threw masterchef contract",
  kcc: {
    tvl: kccTvl,
  },
};