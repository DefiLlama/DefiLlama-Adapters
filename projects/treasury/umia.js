const { sumTokens2 } = require('../helper/unwrapLPs')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
// Ventures 1-6 are test deployments that predate the first real launch.
const FIRST_REAL_VENTURE_ID = 7

const VENTURE_BY_ID =
  'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))'

async function getVentures(api) {
  const count = await api.call({ target: HUB, abi: 'uint256:ventureCount' })
  const ids = []
  for (let id = FIRST_REAL_VENTURE_ID; id <= +count; id++) ids.push(id)
  if (!ids.length) return { ids, ventures: [] }
  const infos = await api.multiCall({ target: HUB, abi: VENTURE_BY_ID, calls: ids })
  return { ids, ventures: infos.map(v => v.venture) }
}

module.exports = {
  base: {
    // Raised capital held by the venture treasuries, in each venture's money token.
    tvl: async (api) => {
      const { ventures } = await getVentures(api)
      if (!ventures.length) return api.getBalances()
      const moneyTokens = await api.multiCall({ abi: 'address:moneyToken', calls: ventures })
      return sumTokens2({ api, tokensAndOwners: ventures.map((v, i) => [moneyTokens[i], v]) })
    },
    // Each venture's own token held by its treasury.
    ownTokens: async (api) => {
      const { ids, ventures } = await getVentures(api)
      if (!ventures.length) return api.getBalances()
      const tokens = await api.multiCall({
        target: HUB, abi: 'function ventureTokenById(uint256) view returns (address)', calls: ids,
      })
      return sumTokens2({ api, tokensAndOwners: ventures.map((v, i) => [tokens[i], v]) })
    },
  },
}
