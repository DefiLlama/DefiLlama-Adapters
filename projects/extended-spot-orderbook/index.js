const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')
const { multiCall } = require('../helper/chain/starknet')

const API_URL = 'https://api.starknet.extended.exchange/api/v1'
const USDC = ADDRESSES.starknet.USDC_CIRCLE

const decimalsAbi = {
  name: 'decimals',
  type: 'function',
  inputs: [],
  outputs: [{ name: 'decimals', type: 'felt' }],
  stateMutability: 'view',
}

async function tvl(api) {
  const { data: markets } = await get(`${API_URL}/info/markets`)
  const spotMarkets = markets.filter(m => m.type === 'SPOT' && m.active && m.status === 'ACTIVE')

  const tokens = spotMarkets.map(m => m.l2Config.syntheticId)
  const decimals = await multiCall({ abi: decimalsAbi, calls: tokens })

  await Promise.all(spotMarkets.map(async (mkt, i) => {
    const { data: ob } = await get(`${API_URL}/info/markets/${mkt.name}/orderbook`)
    const tokenDecimals = Number(decimals[i])
    const collateralResolution = Number(mkt.l2Config.collateralResolution)

    const bidsUSDC = (ob.bid || []).reduce((s, b) => s + Number(b.qty) * Number(b.price), 0)
    api.add(USDC, Math.round(bidsUSDC * collateralResolution))

    const asksTokens = (ob.ask || []).reduce((s, a) => s + Number(a.qty), 0)
    api.add(mkt.l2Config.syntheticId, Math.round(asksTokens * 10 ** tokenDecimals))
  }))
}

module.exports = {
  timetravel: false,
  methodology: 'TVL represents assets locked in limit orders on the Extended spot order book.',
  starknet: { tvl },
}
