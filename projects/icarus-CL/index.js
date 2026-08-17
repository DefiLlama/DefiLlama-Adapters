const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const { getUniTVL } = require('../helper/unknownTokens.js')

const CL_FACTORY = '0x6f7DA11c13Ba09A153dA06d376044e5859Db607B'
const XLPUSD = '0xBCf7A882B6A95827B4996055a5018FdC3B95D40c'
const USDC = '0xe436820ba0C69702c1d3E601d421c0eF38262739'

const enumeratePools = getUniTVL({
  factory: CL_FACTORY,
  fetchBalances: true,
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  },
})

async function tvl(api) {
  const balances = await enumeratePools(api)
  const xlpKey = `rise:${XLPUSD.toLowerCase()}`
  const shares = balances[xlpKey]

  if (!shares || BigNumber(shares).isZero())
    return balances

  const asset = await api.call({
    target: XLPUSD,
    abi: 'address:asset',
  })

  if (asset.toLowerCase() !== USDC.toLowerCase())
    throw new Error(`Unexpected xlpUSD asset: ${asset}`)

  const assets = await api.call({
    target: XLPUSD,
    abi: 'function convertToAssets(uint256) view returns (uint256)',
    params: [BigNumber(shares).toFixed(0)],
  })

  delete balances[xlpKey]
  sdk.util.sumSingleBalance(balances, `rise:${USDC.toLowerCase()}`, assets)
  return balances
}

module.exports = {
  start: '2026-01-26',
  methodology: 'Value of the tokens locked in concentrated-liquidity pools; xlpUSD shares are converted to their USDC.e assets at the queried block.',
  rise: { tvl },
}
