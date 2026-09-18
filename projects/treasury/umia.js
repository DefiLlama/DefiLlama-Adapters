const { nullAddress } = require('../helper/tokenMapping')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
// Ventures 1-6 are test deployments that predate the first real launch.
const FIRST_REAL_VENTURE_ID = 7

const VENTURE_BY_ID =
  'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))'
const VENTURE_VAULT = 'function ventureLiquidityVault(address) view returns (address)'
const TOTAL_ASSETS = 'function totalAssets() view returns (uint256 ventureAssets, uint256 moneyAssets)'

async function getVentures(api) {
  return api.fetchList({ lengthAbi: 'ventureCount', itemAbi: VENTURE_BY_ID, target: HUB, field: 'venture', startFrom: FIRST_REAL_VENTURE_ID, startFromOne: true, })
}

/**
 * Each treasury's pro-rata slice of its venture's SpotLiquidityVault, by share
 * balance. `side` picks the money leg (tvl) or the venture-token leg (ownTokens).
 */
async function addVaultSlice(api, ventures, tokens, side) {
  const vaults = await api.multiCall({ target: HUB, abi: VENTURE_VAULT, calls: ventures })
  const withVault = ventures.map((venture, i) => ({ venture, vault: vaults[i], token: tokens[i] })).filter(v => v.vault !== nullAddress)
  if (!withVault.length) return

  const [shares, totalShares, assets] = await Promise.all([
    api.multiCall({ abi: 'function shareBalance(address) view returns (uint256)', calls: withVault.map(v => ({ target: v.vault, params: v.venture })) }),
    api.multiCall({ abi: 'uint256:totalShares', calls: withVault.map(v => v.vault) }),
    api.multiCall({ abi: TOTAL_ASSETS, calls: withVault.map(v => v.vault) }),
  ])

  withVault.forEach((v, i) => {
    if (totalShares[i] === '0') return
    api.add(v.token, BigInt(assets[i][side]) * BigInt(shares[i]) / BigInt(totalShares[i]))
  })
}

/**
 * Raised capital held by the venture treasuries, in each venture's money token,
 * plus the money leg of the vault shares each treasury holds.
 *
 * No overlap with the protocol adapter's auction escrow: bids are held by the
 * launch contract pre-settlement and only reach the treasury afterwards.
 */
async function tvl(api) {
  const ventures = await getVentures(api)
  const moneyTokens = await api.multiCall({ abi: 'address:moneyToken', calls: ventures, })
  await api.sumTokens({ tokensAndOwners2: [moneyTokens, ventures] })
  await addVaultSlice(api, ventures, moneyTokens, 'moneyAssets')
}

/**
 * Each venture's own token held by its treasury, plus the venture-token leg of
 * its vault shares, reported separately from TVL.
 */
async function ownTokens(api) {
  const ventures = await getVentures(api)
  const tokens = await api.multiCall({ abi: 'address:token', calls: ventures })
  await api.sumTokens({ tokensAndOwners2: [tokens, ventures] })
  await addVaultSlice(api, ventures, tokens, 'ventureAssets')
}

module.exports = {
  base: { tvl, ownTokens },
}
