const sdk = require('@defillama/sdk')
const { ABI_SHORT } = require('./constants.js')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function getTVL(network, block) {
  const chain = network.name

  const { output: assets } = await sdk.api.abi.multiCall({
    abi: ABI_SHORT.asset,
    block, chain,
    calls: network.vaults.map(i => ({ target: i })),
  })

  const toa = []
  assets.forEach(({ output, input: { target }}) => toa.push([output, target ]))
  return sumTokens2({ tokensAndOwners: toa, chain, block, })
}

module.exports = {
  getTVL
}
