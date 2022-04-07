const sdk = require("@defillama/sdk")
const abi = require('./abi.json')
const { getChainTransform } = require('../helper/portedTokens')
const { sumTokens } = require('../helper/unwrapLPs')

const chain = 'ethereum'
const chainConfig = {
  ethereum: {
    controller: '0xa4F1671d3Aee73C05b552d57f2d16d3cfcBd0217'
  }
}

function getChainExports(chain) {
  async function tvl(timestamp, _block, chainBlocks) {
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    const balances = {}
    const { controller } = chainConfig[chain]

    // Get pool list
    const { output: poolsAddress } = await sdk.api.abi.call({ target: controller, abi: abi.pools, block, chain, })
    const { output: poolLength } = await sdk.api.abi.call({ target: poolsAddress, abi: abi.length, block, chain, })

    let calls = []
    for (let i = 0; i < +poolLength; i++)
      calls.push({ params: i })


    let { output: poolList } = await sdk.api.abi.multiCall({ calls, target: poolsAddress, abi: abi.at, block, chain, })
    poolList = poolList.map(p => p.output)

    // Get collateral token
    calls = poolList.map(target => ({ target }))
    const { output: tokens } = await sdk.api.abi.multiCall({ calls, abi: abi.token, chain, block, })
    const tokensAndOwners = tokens.map((t, i) => [t.output, poolList[i]])
    await sumTokens(balances, tokensAndOwners, block, chain, transformAddress)
    // const { output: totalValue } = await sdk.api.abi.multiCall({ calls, abi: abi.totalValue, chain, block, })
    // tokens.forEach((token, index) => sdk.util.sumSingleBalance(balances, transformAddress(token.output), totalValue[index].output))
    return balances
  }

  return {
    [chain]: { tvl }
  }
}

module.exports = {
  start: 1608667205, // December 22 2020 at 8:00 PM UTC
  ...getChainExports(chain)
};
