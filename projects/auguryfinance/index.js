const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const MasterAugur = "0x6ad70613d14c34aa69E1604af91c39e0591a132e";

const polygonTvl = async (api) => {
  const info = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: MasterAugur})
  const tokens = info.map(pool => pool.lpToken)
  return sumTokens2({ api, tokens, owner: MasterAugur, resolveLP: true })
};

module.exports = {
  methodology: 'MasterAugur(MasterChef) contract is used to pull LP token amounts. LP tokens are unwrapped and each token token balance is considered in the TVL sum.',
  polygon: {
    tvl: polygonTvl,
  },
};
