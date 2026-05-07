const FACTORY = '0x45179eE92887e5770E42CD239644bc7b662673af'
const START = 1776985917

const PROJECT_ABI =
  'function getProject(uint256) view returns ((uint256 agentId,string name,string description,string categories,address agent,address treasury,address sale,address agentExecutor,address collateral,uint8 operationalStatus,string statusNote,uint256 createdAt,uint256 updatedAt))'

async function getProjects(api) {
  const projectCount = Number(
    await api.call({ target: FACTORY, abi: 'uint256:projectCount' })
  )
  if (!projectCount) return []
  const projectIds = Array.from({ length: projectCount }, (_, i) => i)
  return api.multiCall({
    target: FACTORY,
    calls: projectIds,
    abi: PROJECT_ABI,
  })
}

// `ownerField` selects which project address holds the collateral: 'sale' or 'treasury'
async function getTokensAndOwners(api, ownerField) {
  const projects = await getProjects(api)
  return projects.map((p) => [p.collateral, p[ownerField]])
}

/** One factory scan; pairs for each (collateral, owner) so TVL includes all listed owners. */
async function getTokensAndOwnersMulti(api, ownerFields) {
  const projects = await getProjects(api)
  const out = []
  for (const p of projects) {
    for (const field of ownerFields) {
      out.push([p.collateral, p[field]])
    }
  }
  return out
}

module.exports = { START, getTokensAndOwners, getTokensAndOwnersMulti }
