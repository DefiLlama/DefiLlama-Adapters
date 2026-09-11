const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x45179eE92887e5770E42CD239644bc7b662673af'
const PROJECT_ABI = 'function getProject(uint256) view returns ((uint256 agentId,string name,string description,string categories,address agent,address treasury,address sale,address agentExecutor,address collateral,uint8 operationalStatus,string statusNote,uint256 createdAt,uint256 updatedAt))'

async function tvl(api) {
  const projectCount = Number(await api.call({ target: FACTORY, abi: 'uint256:projectCount' }))
  if (!projectCount) return {}

  const projects = await api.multiCall({
    target: FACTORY,
    abi: PROJECT_ABI,
    calls: Array.from({ length: projectCount }, (_, i) => i),
  })

  // p.sale holds collateral during raise, p.treasury holds during lockup period (after which, users may redeem their funds)
  const tokensAndOwners = projects.flatMap(p => [
    [p.collateral, p.sale],
    [p.collateral, p.treasury],
  ])
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'TVL is the sum of each project collateral token held in the Sale contract (during raise) and in the project Treasury (after proceeds are transferred), for all projects from AgentRaiseFactory on MegaETH.',
  start: '2026-04-23',
  megaeth: { tvl },
}
