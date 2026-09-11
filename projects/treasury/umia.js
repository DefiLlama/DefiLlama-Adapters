const { sumTokens2 } = require('../helper/unwrapLPs')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
// Ventures 1-6 are test deployments that predate the first real launch.
const FIRST_REAL_VENTURE_ID = 7

const VENTURE_BY_ID =
  'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))'
const VENTURE_TOKEN_BY_ID = 'function ventureTokenById(uint256) view returns (address)'

/**
 * Raised capital held by the venture treasuries, in each venture's money token.
 *
 * No overlap with the protocol adapter: auction bids are escrowed in the launch
 * contract pre-settlement and only reach the treasury afterwards.
 */
async function tvl(api) {
  const ventures = await api.fetchList({ lengthAbi: 'ventureCount', itemAbi: VENTURE_BY_ID, target: HUB, field: 'venture', startFrom: FIRST_REAL_VENTURE_ID, startFromOne: true, })
  const moneyTokens = await api.multiCall({ abi: 'address:moneyToken', calls: ventures, })
  return api.sumTokens({ tokensAndOwners2: [moneyTokens, ventures] })
}

/**
 * Each venture's own token held by its treasury, reported separately from TVL.
 */
async function ownTokens(api) {
  const ventures = await api.fetchList({ lengthAbi: 'ventureCount', itemAbi: VENTURE_BY_ID, target: HUB, field: 'venture', startFrom: FIRST_REAL_VENTURE_ID, startFromOne: true, })
  const tokens = await api.fetchList({ lengthAbi: 'ventureCount', itemAbi: VENTURE_TOKEN_BY_ID, target: HUB, startFrom: FIRST_REAL_VENTURE_ID, startFromOne: true, })
  return api.sumTokens({ tokensAndOwners2: [tokens, ventures] })
}

module.exports = {
  base: { tvl, ownTokens },
}
