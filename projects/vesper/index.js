const sdk = require("@defillama/sdk")
const abi = require('./abi.json')
const { networks: contracts } = require('./contracts.json')
const { getChainTransform } = require('../helper/portedTokens')

const chainConfig = {
  ethereum: {
    controller: '0xa4F1671d3Aee73C05b552d57f2d16d3cfcBd0217',
    stakingPool: '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc',
    VSP: '0x1b40183efb4dd766f11bda7a7c3ad8982e998421',
  }
}

function getChainExports(chain) {
  const { controller, stakingPool, VSP } = chainConfig[chain] || {}

  async function tvl(timestamp, _block, chainBlocks) {
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    const balances = {}
    let network = chain === 'ethereum' ? 'mainnet' : chain
    if (network === 'avax') network = 'avalanche'

    const poolSet = new Set()

    if (controller) {
      // Get pool list from controller
      const { output: poolsAddress } = await sdk.api.abi.call({ target: controller, abi: abi.pools, block, chain, })
      const { output: poolLength } = await sdk.api.abi.call({ target: poolsAddress, abi: abi.length, block, chain, })

      let calls = []
      for (let i = 0; i < +poolLength; i++)
        calls.push({ params: i })

      let { output: pools } = await sdk.api.abi.multiCall({ calls, target: poolsAddress, abi: abi.at, block, chain, })
      pools.forEach(p => poolSet.add(p.output))
    }

    Object.values(contracts[network]).forEach(i => poolSet.add(i.pool.proxy)) // add pools from our contracts list
    if (stakingPool)  poolSet.delete(stakingPool)
    const poolList = [...poolSet]

    // Get collateral token
    calls = poolList.map(target => ({ target }))
    const { output: tokens } = await sdk.api.abi.multiCall({ calls, abi: abi.token, chain, block, })
    const { output: totalValue } = await sdk.api.abi.multiCall({ calls, abi: abi.totalValue, chain, block, })
    tokens.forEach((token, index) => sdk.util.sumSingleBalance(balances, transformAddress(token.output), totalValue[index].output))
    return balances
  }

  let staking

  if (stakingPool)
    staking = async (timestamp, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      const transformAddress = await getChainTransform(chain)
      const balances = {}
      const vspBalance = (await sdk.api.erc20.balanceOf({
        block, chain,
        target: VSP,
        owner: stakingPool
      })).output;
      sdk.util.sumSingleBalance(balances, transformAddress(VSP), vspBalance)
      return balances
    }

  return {
    [chain]: { tvl, staking }
  }
}

module.exports = {
  start: 1608667205, // December 22 2020 at 8:00 PM UTC
  ...['ethereum', 'avax', 'polygon'].reduce((acc, chain) => ({ ...acc, ...getChainExports(chain) }), {})
};
