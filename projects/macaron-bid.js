const { sumTokens2 } = require('./helper/solana')
const { get } = require('./helper/http')

// Macaron Protocol Addresses
const MACARON_TOKEN = '8UiPofjkbjqTqrymz4VY3wXxMcPjFuyq3Psofekymaca'
const STAKING_ADDRESS = '7jirHCE99LM5LKDknU9d3zxpXcxGLEXrh7AkwX9AGqtY'
const PODS_API_URL = 'https://www.macaron.bid/api/pods/stats'

async function staking(api) {
  // Track MACARON tokens staked
  await sumTokens2({
    api,
    tokensAndOwners: [[MACARON_TOKEN, STAKING_ADDRESS]],
  })
}

async function pods(api) {
  // Track tokens locked in Volatility Farming Pods via API
  try {
    const data = await get(PODS_API_URL)
    const podsTvl = data.totalTVL || 0
    api.addUSDValue(podsTvl)
  } catch (error) {
    // Silently fail if API is unavailable
  }
}

async function tvl(api) {
  await staking(api)
  await pods(api)
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: 
    'TVL includes: (1) MACARON tokens staked in the staking contract to earn SOL rewards from protocol fees, ' +
    '(2) All tokens (TKN) locked in Volatility Farming Pods which are wrapped into synthetic pTKN tokens. ' +
    'Pods capture value from market volatility through wrap/unwrap fees and trading activity.'
}

