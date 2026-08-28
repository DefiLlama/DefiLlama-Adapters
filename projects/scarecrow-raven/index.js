const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accRavenPerShare, uint16 depositFeeBP, uint256 lpSupply)",
    "poolLength": "uint256:poolLength"
  };
const { sumTokens2 } = require("../helper/unwrapLPs");

const chef = "0x2639779d6ca9091483a2a7b9a1fe77ab83b90281";

async function tvl(api) {
  const tokens = (await api.fetchList({  lengthAbi: abi.poolLength , itemAbi: abi.poolInfo, target: chef})).map(i => i[0])
  return sumTokens2({ api, tokens, owner: chef, })
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
    tvl,
  }
};
