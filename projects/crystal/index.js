const CRYSTAL = "0x508254c838B2e936B0631440c5C6E3AB3a4a98BD"

const abi = {
  allMarketsLength: "uint256:allMarketsLength",
  allMarkets: "function allMarkets(uint256) view returns (address)",
  wasLaunchpad: "function wasLaunchpad(address) view returns (bool)",
  launchpadTokenToMarket: "function launchpadTokenToMarket(address) view returns (uint112 virtualNativeReserve, uint112 virtualTokenReserve, uint256 k, address creator)",
  getMarket: "function getMarket(address) view returns ((address quoteAsset,address baseAsset,uint256 marketType,uint256 highestBid,uint256 lowestAsk,uint256 scaleFactor,uint256 tickSize,uint256 maxPrice,uint256 minSize,uint256 takerFee,uint256 makerRebate,uint256 reserveQuote,uint256 reserveBase,bool isAMMEnabled))",
}

async function tvl(api) {
  const len = Number(await api.call({ target: CRYSTAL, abi: abi.allMarketsLength }))
  const markets = await api.multiCall({ target: CRYSTAL, abi: abi.allMarkets, calls: Array.from({ length: len }, (_, i) => i.toString()) })
  const infos = await api.multiCall({ target: CRYSTAL, abi: abi.getMarket, calls: markets })
  const graduated = await api.multiCall({ target: CRYSTAL, abi: abi.wasLaunchpad, calls: markets })
  const curves = await api.multiCall({ target: CRYSTAL, abi: abi.launchpadTokenToMarket, calls: infos.map(i => i.baseAsset) })
  // launchpad tokens never count, whether still on the curve or graduated
  const launched = new Set(infos.filter((_, i) => graduated[i] || curves[i].virtualTokenReserve != 0).map(i => i.baseAsset.toLowerCase()))
  const tokens = new Set(infos.flatMap(i => [i.quoteAsset, i.baseAsset]).map(t => t.toLowerCase()).filter(t => !launched.has(t)))
  return api.sumTokens({ owner: CRYSTAL, tokens: [...tokens] })
}

module.exports = {
  methodology: "TVL is the sum of ERC20 balances held by the Crystal singleton contract (orderbook deposits, AMM reserves and MON raised on launchpad bonding curves) across the quote and base assets of every market. Tokens created on the Crystal launchpad are excluded both on the bonding curve and after graduation, so launchpad markets count only their MON side. Balances are read with balanceOf rather than Market.reserveQuote/reserveBase, which hold virtual reserves for pre-graduation markets.",
  monad: { tvl },
}
