const { post } = require("../helper/http")

const ENDPOINT = 'https://levvy-api-v2-testnet.up.railway.app/api/v1/token/platform/stats'
const DECIMALS = 1e6

const fetchPlatformStats = () => post(ENDPOINT, {})

const getValue = async (isBorrowed = false) => {
  const data = await fetchPlatformStats()
  const value = isBorrowed ? data.totalValueBorrowed : data.totalValueLocked
  return { cardano: value / DECIMALS }
}

module.exports = {
  methodology: "Counts ADA locked in token lending offer pools, and tokens locked as collateral in loans",
  misrepresentedTokens: true,
  cardano: {
    tvl: () => getValue(false),
    borrowed: () => getValue(true),
  }
}