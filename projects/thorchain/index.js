const { getCache, get } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/tokenMapping')

async function staking() {
  var res = await get('https://midgard.ninerealms.com/v2/network')
  const { totalActiveBond, totalStandbyBond } = res.bondMetrics
  return {
    "thorchain": (Number(totalActiveBond) + Number(totalStandbyBond)) / 1e8
  }
}

const chainMapping = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  AVAX: 'avax',
  BNB: 'bsc',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  DOGE: 'dogecoin',
  GAIA: 'cosmos',
}

const defillamaChainMapping = {
  'bitcoin-cash': 'bitcoincash',
  'dogecoin': 'doge',
}

function getDChain(chain) {
  return defillamaChainMapping[chainMapping[chain]] || chainMapping[chain]
}

const tokenGeckoMapping = {
  'BNB.TWT-8C2': 'trust-wallet-token',
  'BNB.BUSD-BD1': 'binance-usd',
  'GAIA.ATOM': 'cosmos',
  'BNB.BTCB-1DE': 'bitcoin-bep2',
  'BNB.AVA-645': 'concierge-io',
  'BNB.ETH-1C9': 'ethereum',
}


const blacklistedPools = []

async function tvl(api) {
  const pools = await getCache('https://midgard.ninerealms.com/v2/pools')
  const aChain = api.chain

  const balances = {}
  await Promise.all(pools.map(addPool))
  return balances

  async function addPool({ asset: pool, assetDepth: totalDepth, nativeDecimal, runeDepth }) {
    if (blacklistedPools.includes(pool)) return;
    if (aChain === 'thorchain') {
      sdk.util.sumSingleBalance(balances, 'thorchain', runeDepth/1e8)
      return;
    }
    if (+totalDepth < 1) return;
    let [chainStr, token] = pool.split('.')
    let chain = chainMapping[chainStr]
    const dChain = getDChain(chainStr)
    if (dChain !== aChain) return;

    let [baseToken, address] = token.split('-')
    if (['ethereum', 'bsc', 'avax'].includes(chain)) {
      totalDepth = totalDepth * (10 ** (+nativeDecimal - 8))
      if (address && address.length > 8) {
        address = address.toLowerCase()
        sdk.util.sumSingleBalance(balances, address, totalDepth, chain)
      } else if (chainStr === baseToken) {
        sdk.util.sumSingleBalance(balances, nullAddress, totalDepth, chain)
      } else if (tokenGeckoMapping[pool]) {
        sdk.util.sumSingleBalance(balances, tokenGeckoMapping[pool], totalDepth / 1e8)
      } else {
        sdk.log('skipped', pool, Number(totalDepth).toFixed(2))
      }
    } else {
      if (chainStr === baseToken) {
        if (chain === 'bitcoincash') chain = 'bitcoin-cash'
        sdk.util.sumSingleBalance(balances, chain, totalDepth / 1e8)
      } else if (tokenGeckoMapping[pool]) {
        sdk.util.sumSingleBalance(balances, tokenGeckoMapping[pool], totalDepth / 1e8)
      } else {
        sdk.log('skipped', pool, totalDepth)
      }
    }
  }
}

module.exports = {
  hallmarks: [
    [1626656400, "Protocol paused"],
    [1631754000, "Protocol resumed"],
  ],
  timetravel: false,
  thorchain: {
    tvl,
    staking
  },
}

Object.keys(chainMapping).map(getDChain).forEach(chain => {
  module.exports[chain] = {tvl }
})
