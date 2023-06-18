const sdk = require("@defillama/sdk")
const abi = require('./abi.json')
const { getChainTransform } = require('../helper/portedTokens')
const { getConfig } = require("../helper/cache")

const chainConfig = {
  ethereum: {
    stakingPool: '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc',
    VSP: '0x1b40183efb4dd766f11bda7a7c3ad8982e998421',
    api: ['https://api.vesper.finance/pools?stages=prod', 'https://api.vesper.finance/pools?stages=orbit'],
  },
  avax: {
    api: ['https://api-avalanche.vesper.finance/pools?stages=prod'],
  },
  polygon: {
    api: ['https://api-polygon.vesper.finance/pools?stages=prod'],
  },
  optimism: {
    api: ['https://api-optimism.vesper.finance/pools']
  },
}

function getChainExports(chain) {
  const { stakingPool, VSP, api } = chainConfig[chain] || {}

  async function tvl(timestamp, _block, chainBlocks) {
    const block = chainBlocks[chain]
    const transformAddress = await getChainTransform(chain)
    const balances = {}
    let network = chain === 'ethereum' ? 'mainnet' : chain
    if (network === 'avax') network = 'avalanche'

    const poolSet = new Set()

    for (let i = 0;i< api.length;i++) {
      const key = ['vesper', chain, i].join('/')
      const data = await getConfig(key, api[i])
      data.forEach(pool => poolSet.add(pool.address)) // add pools from our contracts list
    }
    if (stakingPool)  poolSet.delete(stakingPool)
    const poolList = [...poolSet]

    if (!poolList.length) return balances

    // Get collateral token
    const calls = poolList.map(target => ({ target }))
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
  ...['ethereum', 'avax', 'polygon','optimism'].reduce((acc, chain) => ({ ...acc, ...getChainExports(chain) }), {})
};
