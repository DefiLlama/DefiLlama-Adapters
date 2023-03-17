const { get } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { nullAddress } = require('../helper/tokenMapping')

async function staking(timestamp) {
  var res = await get('https://midgard.ninerealms.com/v2/network')
  const { totalActiveBond, totalStandbyBond } = res.bondMetrics
  return {
    "thorchain": (Number(totalActiveBond) + Number(totalStandbyBond)) / 1e8
  }
}

const FIVE_HOURS = 5 * 60 * 60

const chainMapping = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  AVAX: 'avax',
  BNB: 'bsc',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  DOGE: 'dogecoin',
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

async function tvl(ts) {
  const pools = await get('https://midgard.ninerealms.com/v2/pools')

  const balances = {}
  await Promise.all(pools.map(addPool))
  return balances

  async function addPool({ asset: pool, assetDepth: totalDepth, nativeDecimal, runeDepth }) {
    if (blacklistedPools.includes(pool)) return;
    sdk.util.sumSingleBalance(balances, 'thorchain', runeDepth/1e8)
    if (+totalDepth < 1) return;
    let [chainStr, token] = pool.split('.')
    const chain = chainMapping[chainStr]
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
    [1658145600, "Kill Switch"] //https://twitter.com/THORChain/status/1549078524253847553?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1549078524253847553%7Ctwgr%5Edf22fb0a2751e6182143d32b477f2b7f759b8a9f%7Ctwcon%5Es1_&ref_url=https%3A%2F%2Ffinance.yahoo.com%2Fnews%2Fthorchain-phases-support-rune-tokens-123034231.html
  ],
  timetravel: false,
  thorchain: {
    tvl,
    staking
  },
}
