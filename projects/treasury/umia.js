const { sumTokens2 } = require('../helper/unwrapLPs')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'

async function getVentures(api) {
  const count = await api.call({ target: HUB, abi: 'uint256:ventureCount' })
  const ids = Array.from({ length: +count }, (_, i) => i + 1) // venture ids are 1-based
  const infos = await api.multiCall({
    target: HUB,
    abi: 'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))',
    calls: ids,
  })
  return { ids, ventures: infos.map(v => v.venture) }
}

module.exports = {
  base: {
    // cumulative value held by the venture treasuries (raised money tokens etc.)
    tvl: async (api) => {
      const { ventures } = await getVentures(api)
      const moneyTokens = await api.multiCall({ abi: 'address:moneyToken', calls: ventures })
      const tokensAndOwners = ventures.map((v, i) => [moneyTokens[i], v])
      return sumTokens2({ api, tokensAndOwners })
    },
    // each venture's own token held by its treasury
    ownTokens: async (api) => {
      const { ids, ventures } = await getVentures(api)
      const tokens = await api.multiCall({ target: HUB, abi: 'function ventureTokenById(uint256) view returns (address)', calls: ids })
      const tokensAndOwners = ventures.map((v, i) => [tokens[i], v])
      return sumTokens2({ api, tokensAndOwners })
    },
  },
}
