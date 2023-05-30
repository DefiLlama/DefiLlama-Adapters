const { get } = require('../helper/http')

let lendData
let overviewData

async function getLendData() {
  if (!lendData)
    lendData = get('https://ethereumbridgebackend.azurewebsites.net/sienna_lend_latest_data')
  return lendData
}

async function getOverviewData() {
  if (!overviewData)
    overviewData = get('https://ethereumbridgebackend.azurewebsites.net/sienna_token_statistics')
  return overviewData
}

async function getPoolLiquidity() {
  let pool_liquidity
  const { data } = await get('https://ethereumbridgebackend.azurewebsites.net/sienna_token_historical_data?type=hourly&period=1+days')
  data.filter(i => i.pool_liquidity).forEach(i => pool_liquidity = i.pool_liquidity)
  return pool_liquidity
}

async function tvl() {
  const [ lend, overview ] = await Promise.all([getLendData(), getOverviewData()])
  return {
    tether: lend.data.underlying_balance_usd + (await getPoolLiquidity())
  }
}

async function staking() {
  const overview = await getOverviewData()
  return {
    tether: overview.staked
  }
}

async function borrowed() {
  const lend = await getLendData()
  return {
    tether: lend.data.total_borrows_usd
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: 'All tokens locked in SIENNA Network pairs + All the supplied tokens to Sienna Lend Markets + Staked Sienna;',
  secret: {
    tvl,
    staking,
    borrowed,
  }
}