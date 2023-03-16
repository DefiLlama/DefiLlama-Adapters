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
  // 'BNB.ADA-9F4': '',
}


const blacklistedPools = [
  "ETH.WBTC-0X2260FAC5E5542A773AA44FBCFEDF7C193BC2C599",
  "ETH.YFI-0X0BC529C00C6401AEF6D220BE8C6EA1667F6AD93E",
]

async function tvl(ts) {
  const { intervals: [{ poolsDepth, endTime }] } = await get('https://midgard.ninerealms.com/v2/history/tvl')
  if (endTime < (ts - FIVE_HOURS)) throw new Error('Stale Data!')

  const balances = {}
  await Promise.all(poolsDepth.map(addPool))
  return balances

  async function addPool({ pool, totalDepth }) {
    if (blacklistedPools.includes(pool)) return;
    if (+totalDepth < 1) return;
    let [chainStr, token] = pool.split('.')
    const chain = chainMapping[chainStr]
    let [baseToken, address] = token.split('-')
    if (['ethereum', 'bsc', 'avax'].includes(chain)) {
      if (address && address.length > 8) {
        address = address.toLowerCase()
        let decimals = await sdk.api2.abi.call({ target: address, chain, abi: 'erc20:decimals' })
        sdk.util.sumSingleBalance(balances, address, totalDepth * (10 ** (decimals - 8)), chain)
      } else if (chainStr === baseToken) {
        sdk.util.sumSingleBalance(balances, nullAddress, totalDepth * 1e6, chain)
      } else {
        sdk.log('skipped', pool, Number(totalDepth / 1e8).toFixed(2))
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
