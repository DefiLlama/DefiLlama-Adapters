const { getCache, get } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/tokenMapping')

async function staking() {
  var res = await get('https://midgard.mayachain.info/v2/network')
  const { totalActiveBond, totalStandbyBond } = res.bondMetrics
  return {
    "mayachain": (Number(totalActiveBond) + Number(totalStandbyBond)) / 1e10
  }
}

const chainMapping = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  RUNE: 'thorchain',
  DASH: 'dash',
  KUJI: 'kujira',
}

const defillamaChainMapping = {
  'bitcoin-cash': 'bitcoincash',
  'dogecoin': 'doge',
}

function getDChain(chain) {
  return defillamaChainMapping[chainMapping[chain]] || chainMapping[chain]
}

const blacklistedPools = []

async function tvl(_, _1, _2, { api }) {
  const pools = await getCache('https://midgard.mayachain.info/v2/pools')
  const aChain = api.chain

  const balances = {}
  await Promise.all(pools.map(addPool))
  return balances

  async function addPool({ asset: pool, assetDepth: totalDepth, nativeDecimal, runeDepth }) {
    if (blacklistedPools.includes(pool)) return;
    if (aChain === 'mayachain') {
      sdk.util.sumSingleBalance(balances, 'mayachain', runeDepth/1e10)
      return;
    }
    if (+totalDepth < 1) return;
    let [chainStr, token] = pool.split('.')
    let chain = chainMapping[chainStr]
    const dChain = getDChain(chainStr)
    if (dChain !== aChain) return;

    let [baseToken, address] = token.split('-')
    if (['ethereum'].includes(chain)) {
      totalDepth = totalDepth * (10 ** (+nativeDecimal - 10))
      if (address && address.length > 8) {
        address = address.toLowerCase()
        sdk.util.sumSingleBalance(balances, address, totalDepth, chain)
      } else if (chainStr === baseToken) {
        sdk.util.sumSingleBalance(balances, nullAddress, totalDepth, chain)
      } else if (tokenGeckoMapping[pool]) {
        sdk.util.sumSingleBalance(balances, tokenGeckoMapping[pool], totalDepth / 1e10)
      } else {
        sdk.log('skipped', pool, Number(totalDepth).toFixed(2))
      }
    } else {
      if (chainStr === baseToken) {
        if (chain === 'dash') chain = 'dash'
        sdk.util.sumSingleBalance(balances, chain, totalDepth / 1e10)
      } else if (tokenGeckoMapping[pool]) {
        sdk.util.sumSingleBalance(balances, tokenGeckoMapping[pool], totalDepth / 1e10)
      } else {
        sdk.log('skipped', pool, totalDepth)
      }
    }
  }
}

module.exports = {
  timetravel: false,
  mayachain: {
    tvl,
    staking
  },
}

Object.keys(chainMapping).map(getDChain).forEach(chain => {
  module.exports[chain] = {tvl }
})
