const { calculateStrategyVaultPositionsAum, getCurrentValuationClock } = require('./calculator')
const { resolveManagedUnderlyingMint } = require('./constants')
const { createStrategyVaultPrograms } = require('./programs')
const { fetchExponentPrices } = require('./prices')
const { fetchStrategyVaultAccounts } = require('./vaults')

async function fetchStrategyVaultAums(connection) {
  const programs = createStrategyVaultPrograms(connection)
  const [vaultAccounts, prices, valuationClock] = await Promise.all([
    fetchStrategyVaultAccounts(programs),
    fetchExponentPrices(connection),
    getCurrentValuationClock(connection),
  ])

  const vaultAums = []
  for (const { publicKey, account } of vaultAccounts) {
    try {
      const aumResults = await calculateStrategyVaultPositionsAum(programs, account, prices, valuationClock)
      const aumRaw = aumResults.reduce((sum, result) => sum + result.aum, 0n)
      vaultAums.push({
        vaultAddress: publicKey.toBase58(),
        underlyingMint: account.underlyingMint.toBase58(),
        aumRaw,
        aumResults,
      })
    } catch (error) {
      console.warn('Failed to calculate Exponent strategy vault AUM', {
        vaultAddress: publicKey.toBase58(),
        error,
      })
    }
  }

  return vaultAums
}

module.exports = {
  fetchStrategyVaultAums,
  resolveManagedUnderlyingMint,
}
