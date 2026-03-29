const GBLIN_VAULT = "0xED334B4CDaFCAe6D42bb9A57DE565fD3e9640a50"
const BASKET_ABI = 'function basket(uint256) view returns (address token, address oracle, uint24 poolFee, bool isStable, uint256 baseWeight, uint256 dynamicWeight, uint256 peakPrice, uint256 lastPeakUpdate)'

const tvl = async (api) => {
  const baskets = await api.fetchList({ target : GBLIN_VAULT, itemCount: 10, itemAbi: BASKET_ABI, permitFailure: true })
  const tokens = baskets.map(b => b?.token).filter(Boolean)
  return api.sumTokens({ owner: GBLIN_VAULT, tokens })
}

module.exports = {
  methodology: "TVL is calculated by summing the WETH, cbBTC, and USDC strictly locked as backing collateral inside the GBLIN Autonomous Central Bank contract on Base.",
  base: { tvl }
}
