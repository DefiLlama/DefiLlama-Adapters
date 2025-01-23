const { queryV1Beta1, sumTokens } = require('./helper/chain/cosmos')
const ADDRESSES = require('./helper/coreAssets.json')

const coreAssets = new Set()
Object.values(ADDRESSES.osmosis).forEach(i => coreAssets.add(i))
Object.values(ADDRESSES.ibc).forEach(i => coreAssets.add('ibc/' + i))

const chain = 'osmosis'

async function tvl(api) {
  // // https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=true
  // https://lcd.osmosis.zone/osmosis/gamm/v1beta1/pools?pagination.limit=100&pagination.count_total=true
  const owners = []
  const blacklistedTokens = new Set()

  const { pools } = await queryV1Beta1({ chain, url: '/poolmanager/v1beta1/all-pools' })

  pools.forEach((i) => {
    const poolId = i?.total_shares?.denom
    if (poolId) blacklistedTokens.add(poolId)
    if (i.address) blacklistedTokens.add(i.address)
    if (i.contract_address) blacklistedTokens.add(i.contract_address)
  })

  pools.forEach((i) => {
    switch (i['@type']) {
      case '/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool':
        i.pool_liquidity.forEach(i => !blacklistedTokens.has(i.denom) && api.add(i.denom, i.amount))
        break;
      case '/osmosis.gamm.v1beta1.Pool': addDefaultPoolData(i); break;
      case '/osmosis.concentratedliquidity.v1beta1.Pool': addCLPool(i); break;
      case '/osmosis.cosmwasmpool.v1beta1.CosmWasmPool': break;
      default: throw new Error('Unknown pool type' + i['@type'])
    }
  })
  return sumTokens({ balances: api.getBalances(), chain, owners, blacklistedTokens: [...blacklistedTokens], })

  function addCLPool(i) {
    owners.push(i.address)
  }

  function addDefaultPoolData(i) {
    const coreData = i.pool_assets.find(i => coreAssets.has(i.token.denom))

    i.pool_assets.forEach(i => {
      if (blacklistedTokens.has(i.token.denom)) return;
      if (!coreAssets.has(i.token.denom) && coreData) {
        api.add(coreData.token.denom, coreData.token.amount)
        return;
      } else if (!coreAssets.has(i.token.denom)) {
        api.add(i.token.denom, i.token.amount)
        return;
      }
      api.add(i.token.denom, i.token.amount)
    })
  }
}



module.exports = {
  misrepresentedTokens: true,
  methodology: "Counts the liquidity on all AMM pools",
  osmosis: {
    tvl
  }
}