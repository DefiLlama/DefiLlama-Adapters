const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const FACTORY = '0xbFA531C90FD9e42aC13Af14823B30e40761dd3A2'
const BUYBACK_SAFE = '0x79aF491d1B533A3fcD1c9ab009931aC95701F6ff'
const GROWTH_SINK = '0x73F5111EE91672c114923793C03B5c868d9C5E03'
const USDG = '0xe343167631d89B6Ffc58B88d6b7fB0228795491D'

async function tvl(api) {
  const stockCount = await api.call({ abi: 'uint256:stockCount', target: FACTORY })
  const stocks = Number(stockCount)
    ? await api.multiCall({
        abi: 'function allStocks(uint256) view returns (address)',
        target: FACTORY,
        calls: Array.from({ length: Number(stockCount) }, (_, i) => i),
      })
    : []

  // Track only idle assets in Buyback Safe and Growth Sink; Growth Sink's LP vault shares are already counted in TVL
  const tokens = [
    nullAddress,
    ADDRESSES.ink.WETH,
    ADDRESSES.ink.USDT0,
    ADDRESSES.ink.USDC,
    USDG,
    ...stocks,
  ]

  return sumTokens2({ api, owners: [BUYBACK_SAFE, GROWTH_SINK], tokens })
}

module.exports = {
  methodology:
    'Tracks idle assets held by the Quotrons Ink Buyback Safe and Growth Sink, excluding growth-owned LP vault shares already counted in protocol TVL.',
  ink: {
    tvl,
  },
}
