const abi = {
  "stakedTokenTotal": "function stakedTokenTotal(address) view returns (uint256)",
  "getNumTokensStaked": "uint256:getNumTokensStaked",
  "getTokenStakedAt": "function getTokenStakedAt(uint256 index) view returns (address token)"
}
const { sumTokens2 } = require("../helper/unwrapLPs");

async function tvl(api) {
  const staker  = '0x6a894bd1A5476Bdc52B709623B8751e244E6e975';
  const tokens = await api.fetchList({  lengthAbi: abi.getNumTokensStaked, itemAbi: abi.getTokenStakedAt, target: staker})
  const bals  = await api.multiCall({  abi: abi.stakedTokenTotal, calls: tokens, target: staker})
  api.add(tokens, bals)
  return sumTokens2({ api, resolveLP: true})
}


module.exports = {
  methodology:
    "TVL is calculated by summing up all reward program total staked values.",
  arbitrum: {
    tvl,
  },
};
