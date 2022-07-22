const sdk = require('@defillama/sdk')
const { ABI_SHORT } = require('./constants.js')

async function getTVL (network, block) {
  const balances = {}
  const pairs = []

  const assets = await sdk.api.abi.multiCall({
    abi: ABI_SHORT.asset,
    block,
    calls: network.vaults
      .map(vault => [
        {
          target: vault,
          params: []
        }
      ])
      .reduce((prev, curr) => prev.concat(curr), []),
    chain: network.name
  })

  if (assets && assets.output) {
    pairs.push(
      ...assets.output
        .map(result => {
          if (![true, 'true'].includes(result.success)) return null

          return {
            asset: result.output,
            vault: result.input.target
          }
        })
        .filter(item => item !== null)
    )
  }

  const amounts = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    calls: pairs.map(pair => ({
      target: pair.asset,
      params: [pair.vault]
    })),
    chain: network.name
  })

  const transform = address => `${network.name}:${address}`

  sdk.util.sumMultiBalanceOf(balances, amounts, true, transform)

  return balances
}

module.exports = {
  getTVL
}
