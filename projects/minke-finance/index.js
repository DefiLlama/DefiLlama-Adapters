const FACTORY = '0xbBDC68D1f35c7Ca40C0Fa9ec24cAE8ee09B807Bb'
const BSC_CHAIN_ID = 56

const CL_QUOTER_BY_CHAIN_ID = {
  [BSC_CHAIN_ID]: '0x9f75dd27d6664c475b90e105573e550ff69437b0',
}

const POOL_KEY_BY_CHAINID_VAULT = {
  '56-0x9f9682f78b42614b67c37f0038a9b979cdd152d3': {
    currency0: '0x2F9240F2919A4A93e10eC0F80a59f3771B99eaFe',
    currency1: '0x3B4de3c7855C03bB9F50ea252cD2c9FA1125Ab07',
    fee: 100,
    tickSpacing: 1,
    hooks: '0x0000000000000000000000000000000000000000',
  },
}

function getQuoteAmount(decimals) {
  const d = Number(decimals) || 18
  const exp = Math.max(0, Math.floor(d / 2))
  return 10n ** BigInt(exp)
}

async function quoteExactInputSingle(api, { quoter, poolKey, zeroForOne, amountIn }) {
  const quote = await api.call({
    target: quoter,
    abi: 'function quoteExactInputSingle(((address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks) poolKey,bool zeroForOne,uint128 exactAmount,bytes hookData) params) returns (uint256 amountOut, uint256 gasEstimate)',
    params: [{
      poolKey,
      zeroForOne,
      exactAmount: amountIn.toString(),
      hookData: '0x',
    }],
    permitFailure: true,
  })
  if (!quote) return null
  return quote.amountOut ?? quote[0]
}

async function tvl(api) {
  const pools = await api.fetchList({
    target: FACTORY,
    lengthAbi: 'getPoolCount',
    itemAbi: 'getPoolAt',
  })

  if (!pools.length) return {}

  const chainId = Number(api.chainId ?? BSC_CHAIN_ID)
  const quoter = CL_QUOTER_BY_CHAIN_ID[chainId]
  if (!quoter) return {}

  const [vtTokens, projectTokens] = await Promise.all([
    api.multiCall({ abi: 'address:vtToken', calls: pools }),
    api.multiCall({ abi: 'address:projectToken', calls: pools }),
  ])

  const [vtDecimals, vtSupplies] = await Promise.all([
    api.multiCall({ abi: 'erc20:decimals', calls: vtTokens }),
    api.multiCall({ abi: 'erc20:totalSupply', calls: vtTokens }),
  ])

  for (let i = 0; i < pools.length; i++) {
    const vault = pools[i]?.toLowerCase?.()
    const configKey = `${chainId}-${vault}`
    const poolKey = POOL_KEY_BY_CHAINID_VAULT[configKey]
    if (!poolKey) continue

    const vtToken = vtTokens[i]
    const projectToken = projectTokens[i]
    const vtSupply = vtSupplies[i]
    if (!vtToken || !projectToken || !vtSupply) continue

    const vtLower = vtToken.toLowerCase()
    const token0 = poolKey.currency0.toLowerCase()
    const token1 = poolKey.currency1.toLowerCase()
    const zeroForOne = vtLower === token0 ? true : vtLower === token1 ? false : null
    if (zeroForOne === null) continue

    const quoteAmount = getQuoteAmount(vtDecimals[i])
    const amountOut = await quoteExactInputSingle(api, { quoter, poolKey, zeroForOne, amountIn: quoteAmount })
    if (!amountOut) continue

    const tAmount = BigInt(vtSupply) * BigInt(amountOut) / quoteAmount
    if (tAmount > 0n) api.add(projectToken, tAmount.toString())
  }

  return api.getBalances()
}

module.exports = {
  bsc: {
    tvl,
  },
}
