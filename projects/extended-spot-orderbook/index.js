const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { getConfig } = require('../helper/cache')

const API_URL = 'https://api.starknet.extended.exchange/api/v1'
const USDC = ADDRESSES.arc.USDC

async function tvl(api) {
  const { data: markets } = await getConfig('extended-spot-orderbook', `${API_URL}/info/markets`)
  const { data: assets } = await getConfig('extended-spot-orderbook/assets', `${API_URL}/info/assets`)
  const arcAddress = Object.fromEntries(assets.filter(a => a.arcAddress).map(a => [a.name, a.arcAddress]))
  const spotMarkets = markets.filter(m => m.type === 'SPOT' && m.active && m.status === 'ACTIVE' && arcAddress[m.assetName])

  const tokens = spotMarkets.map(m => arcAddress[m.assetName])
  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })

  for (const [i, mkt] of spotMarkets.entries()) {
    const { data: ob } = await get(`${API_URL}/info/markets/${mkt.name}/orderbook`)
    const tokenDecimals = Number(decimals[i])
    const collateralResolution = Number(mkt.l2Config.collateralResolution)

    const bidsUSDC = (ob.bid || []).reduce((s, b) => s + Number(b.qty) * Number(b.price), 0)
    api.add(USDC, Math.round(bidsUSDC * collateralResolution))

    const asksTokens = (ob.ask || []).reduce((s, a) => s + Number(a.qty), 0)
    api.add(tokens[i], Math.round(asksTokens * 10 ** tokenDecimals))
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL represents assets locked in limit orders on the Extended spot order book. Extended settles on Arc since 22 October 2026.',
  starknet: { tvl: () => ({}) },
  arc: { tvl },
}
