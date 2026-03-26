const GBLIN_VAULT = "0xc475851f9101A2AC48a84EcF869766A94D301FaA"
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
