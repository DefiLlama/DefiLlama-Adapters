const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x45179eE92887e5770E42CD239644bc7b662673af'
const START = 1776985917
const PROJECT_ABI =
  'function getProject(uint256) view returns (uint256 agentId,string name,string description,string categories,address agent,address treasury,address sale,address agentExecutor,address collateral,uint8 operationalStatus,string statusNote,uint256 createdAt,uint256 updatedAt)'

async function tvl(api) {
  const projectCount = Number(
    await api.call({
      target: FACTORY,
      abi: 'uint256:projectCount',
    })
  )

  if (!projectCount) return {}

  const projectIds = Array.from({ length: projectCount }, (_, i) => i)
  const projects = await api.multiCall({
    target: FACTORY,
    calls: projectIds,
    abi: PROJECT_ABI,
  })

  const tokensAndOwners = projects.flatMap(({ collateral, sale, treasury }) => [
    [collateral, sale],
    [collateral, treasury],
  ])

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'TVL is the sum of collateral tokens currently held by every Backed Sale contract and every project treasury Safe deployed by the AgentRaiseFactory on MegaETH.',
  start: START,
  megaeth: { tvl },
}
