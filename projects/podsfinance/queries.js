const sdk = require('@defillama/sdk')

const { EXPIRATION_START_FROM } = require('./constants.js')
const { getOptions } = require('./subgraph.js')

async function getTVL (network, block) {
  const balances = {}
  const options = await getOptions(network, EXPIRATION_START_FROM)

  const collateralInOptions = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    calls: options
      .filter(option => option && option.strikeAsset && option.address)
      .map(option => ({
        target: option.strikeAsset,
        params: [option.address]
      })),
    chain: network.name
  })

  const stablesInPools = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    calls: options
      .filter(option => option && option.pool && option.pool.address)
      .map(option => ({
        target: option.pool.tokenB,
        params: [option.pool.address]
      })),
    chain: network.name
  })

  const transform = address => `${network.name}:${address}`

  sdk.util.sumMultiBalanceOf(balances, collateralInOptions, true, transform)
  sdk.util.sumMultiBalanceOf(balances, stablesInPools, true, transform)
  return balances
}

module.exports = {
  getTVL
}
