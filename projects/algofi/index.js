const sdk = require('@defillama/sdk')
const { log } = require('../helper/utils')
const { getAppGlobalState, } = require("../helper/chain/algorand")
const { getPrices, appDictionary, marketStrings } = require('./utils')


async function getMarketAssets(prices) {
  const assets = []
  for (const [assetName, config] of Object.entries(appDictionary)) {
    if (['STBL', 'STBL2', 'BANK'].includes(assetName)) {
      log('ignoring native stablecoin', assetName)
      continue;
    }
    if (!prices[assetName]) {
      log('Asset is not yet priced, ignoring it: ', assetName)
      continue;
    }
    if (prices[assetName].geckoId === 'disabled') continue;
    assets.push([assetName, config]) 
  }
  return assets
}

async function borrowed() {
  const balances = {}
  let promises = []
  let prices = await getPrices()
  const assets = await getMarketAssets(prices)
  for (const [assetName, { appIds = [] }] of assets)
    for (const appId of appIds)
      promises.push(addMarketAsset({assetName, appId, prices, balances}))
    
  await Promise.all(promises)
  return balances

  async function addMarketAsset({assetName, appId, prices, balances}) {
    const { geckoId, decimals, price } = prices[assetName]
    let state = await getAppGlobalState(appId)
    let borrowed = state[marketStrings.underlying_borrowed]
    const balance = borrowed * price / (10 ** decimals)
    sdk.util.sumSingleBalance(balances, geckoId, balance)
  }
}

async function tvl() {
  const balances = {}
  let promises = []
  let prices = await getPrices()
  const assets = await getMarketAssets(prices)
  for (const [assetName, { appIds = [] }] of assets)
    for (const appId of appIds)
      promises.push(addMarketAsset({assetName, appId, prices, balances}))
    
  await Promise.all(promises)
  return balances

  async function addMarketAsset({assetName, appId, prices, balances}) {
    const { geckoId, decimals, price } = prices[assetName]
    let state = await getAppGlobalState(appId)
    let underlyingCash
    switch(assetName) {
      case 'vALGO2': underlyingCash = state[marketStrings.active_collateral_v2]; break;
      case 'vALGO': underlyingCash = state[marketStrings.active_collateral]; break;
      default: underlyingCash = state[marketStrings.underlying_cash]; break;
    }
    let supplyUnderlying = underlyingCash
    const balance = supplyUnderlying * price / (10 ** decimals)
    sdk.util.sumSingleBalance(balances, geckoId, balance)
  }
}

async function staking() {
  let prices = await getPrices()
  const { geckoId, decimals, price } = prices['BANK']

  // voting escrow
  let votingEscrowGlobalState = await getAppGlobalState(900653165)
  let opulState = await getAppGlobalState(674526408)
  let totalLockedBank = votingEscrowGlobalState[marketStrings.total_locked]
  let totalOpul = opulState[marketStrings.underlying_cash] - opulState[marketStrings.underlying_reserves]
  const balance = totalLockedBank * price / (10 ** decimals)

  return  {
    [geckoId]: balance,
    opulous: totalOpul / 1e10,
  }
}

module.exports = {
  hallmarks: [
    [1688947200, "Winding down of protocol"]
  ],
  timetravel: false,
  misrepresentedTokens: true,
  algorand: {
    tvl,
    borrowed,
    staking,
  }
}
