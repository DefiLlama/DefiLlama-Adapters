const CRYSTAL = "0x508254c838B2e936B0631440c5C6E3AB3a4a98BD"

const abi = {
  allMarketsLength: "uint256:allMarketsLength",
  allMarkets: "function allMarkets(uint256) view returns (address)",
  launchpadTokenToMarket: "function launchpadTokenToMarket(address) view returns (uint112 virtualNativeReserve, uint112 virtualTokenReserve, uint256 k, address creator)",
  getMarket: "function getMarket(address) view returns ((address quoteAsset,address baseAsset,uint256 marketType,uint256 highestBid,uint256 lowestAsk,uint256 scaleFactor,uint256 tickSize,uint256 maxPrice,uint256 minSize,uint256 takerFee,uint256 makerRebate,uint256 reserveQuote,uint256 reserveBase,bool isAMMEnabled))",
}

async function tvl(api) {
  const len = Number(await api.call({ target: CRYSTAL, abi: abi.allMarketsLength }))
  const markets = await api.multiCall({ target: CRYSTAL, abi: abi.allMarkets, calls: Array.from({ length: len }, (_, i) => i.toString()) })
  const infos = await api.multiCall({ target: CRYSTAL, abi: abi.getMarket, calls: markets, permitFailure: true })
  const tokens = new Set()
  for (const info of infos) if (info) { tokens.add(info.quoteAsset); tokens.add(info.baseAsset) }
  const launchpad = await api.multiCall({ target: CRYSTAL, abi: abi.launchpadTokenToMarket, calls: [...tokens] })
  return api.sumTokens({ owner: CRYSTAL, tokens: [...tokens].filter((_, i) => launchpad[i].virtualTokenReserve == 0) })
}

module.exports = {
  methodology: "TVL is the sum of ERC20 balances held by the Crystal singleton contract across every quote and base asset of every deployed market. This captures orderbook deposits, post-graduation AMM reserves, and the real (non-virtual) native-token portion of pre-graduation launchpad buys in one read. Tokens still on the launchpad bonding curve (launchpadTokenToMarket.virtualTokenReserve != 0) are excluded, since their Crystal balance is unsold supply rather than deposited value; graduated tokens are kept because their balance is real AMM reserves. AMM Market.reserveQuote/reserveBase are NOT added separately because those tokens already sit inside Crystal's balance (adding them would double-count real reserves and fabricate the constant-product k targets for pre-graduation markets). ",
  monad: { tvl },
}
