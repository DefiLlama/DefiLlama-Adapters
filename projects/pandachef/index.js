const abi = {
  "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accBaoPerShare)"
}
const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");


const masterChef = "0x9942cb4c6180820E6211183ab29831641F58577A";
const PNDA = "0x47DcC83a14aD53Ed1f13d3CaE8AA4115f07557C0";

async function tvl(api) {
  const tokenInfo = await api.fetchList({  lengthAbi: 'uint256:poolLength', itemAbi: abi.poolInfo, target: masterChef })
  let tokens = tokenInfo.map(i => i.lpToken)
  const symbols = await api.multiCall({  abi: 'erc20:symbol', calls: tokens})
  tokens = tokens.filter((_, i) => symbols[i] !== 'PNDA-V2') // skip own LP tokens
  return sumTokens2({ api, owner: masterChef, tokens, blacklistedTokens: [PNDA], resolveLP: true, })
}

module.exports = {
  bsc: {
    tvl,
    staking: staking(masterChef, PNDA)
  }
}