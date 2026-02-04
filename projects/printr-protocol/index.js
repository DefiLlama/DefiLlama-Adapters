const { getConfig } = require('../helper/cache')

const PRINTR_API = 'https://api-preview.printr.money'

// Printr contract is deployed at the same address on all chains (CREATE2)
const PRINTR_CONTRACT = '0x4d9C01EBFDa5b5C14890F545abeA0a10924Bca5f'

// getCurve(address token) returns CurveInfo struct
const GET_CURVE_ABI = 'function getCurve(address token) view returns (tuple(address basePair, uint16 totalCurves, uint256 maxTokenSupply, uint256 virtualReserve, uint256 reserve, uint256 completionThreshold))'

// Chain ID mapping for API calls
const chainIds = {
  bsc: 56,
  arbitrum: 42161,
  base: 8453,
  avax: 43114,
  mantle: 5000,
}

async function fetchTokenList(chainId) {
  const endpoint = `${PRINTR_API}/chains/${chainId}/tokenlist.json`
  const data = await getConfig(`printr-protocol/${chainId}`, endpoint)
  return data.tokens || []
}

async function tvl(api) {
  const chain = api.chain
  const chainId = chainIds[chain]

  if (!chainId) {
    return {}
  }

  const tokens = await fetchTokenList(chainId)

  if (!tokens.length) {
    return {}
  }

  // Get curve info for all tokens
  const curves = await api.multiCall({
    abi: GET_CURVE_ABI,
    calls: tokens.map(t => ({ target: PRINTR_CONTRACT, params: [t.address] })),
  })

  // Sum reserves by base pair token
  curves.forEach((curve) => {
    if (curve && curve.reserve > 0) {
      api.add(curve.basePair, curve.reserve)
    }
  })
}

module.exports = {
  methodology: 'TVL is the sum of reserves locked in active Printr bonding curves. Each curve holds a base pair token (e.g., USDC, WETH) that users deposit to buy Telecoins. Graduated tokens (curves with reserve=0) have their liquidity in DEX pools, tracked separately.',
  bsc: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  avax: { tvl },
  mantle: { tvl },
}
