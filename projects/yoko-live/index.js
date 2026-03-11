const { sumTokens2 } = require("../helper/unwrapLPs");

const AGENT_FACTORY_ADDRESS = "0xc4aA72712E22D06fBdF54b5413d4270B1A965Ef2";

async function tvl(api) {
  const agents = await api.fetchList({ lengthAbi: 'totalAgents', itemAbi: 'allAgentTokens', target: AGENT_FACTORY_ADDRESS })
  const veTokens = await api.fetchList({ lengthAbi: 'totalAgents', itemAbi: 'allVeTokens', target: AGENT_FACTORY_ADDRESS })
  const liquidityPools = await api.multiCall({ abi: 'address[]:liquidityPools', calls: agents })
  const ownerTokens = veTokens.map((agent, i) => [liquidityPools[i], agent])
  return sumTokens2({ ownerTokens, api, resolveLP: true, })
}

module.exports = {
  methodology: "Calculates TVL by summing the value of all tokens in UniV2 liquidity pools associated with agent tokens",
  sonic: {
    tvl
  }
};