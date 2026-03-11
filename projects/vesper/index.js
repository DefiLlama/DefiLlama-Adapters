const { getConfig } = require("../helper/cache")
const { sumTokensExport } = require("../helper/unwrapLPs")

const chainConfig = {
  ethereum: {
    stakingPool: '0xbA4cFE5741b357FA371b506e5db0774aBFeCf8Fc',
    VSP: '0x1b40183efb4dd766f11bda7a7c3ad8982e998421',
    endpoints: ['https://api.vesper.finance/pools?stages=prod', 'https://api.vesper.finance/pools?stages=orbit'],
  },
  avax: {
    endpoints: ['https://api-avalanche.vesper.finance/pools?stages=prod'],
  },
  polygon: {
    endpoints: ['https://api-polygon.vesper.finance/pools?stages=prod'],
  },
  optimism: {
    endpoints: ['https://api-optimism.vesper.finance/pools']
  },
  base: {
    endpoints: ['https://api-base.vesper.finance/pools']
  },
}

function getChainExports(chain) {
  const { stakingPool, VSP, endpoints } = chainConfig[chain] || {}

  async function tvl(api) {
    const poolSet = new Set()

    for (let i = 0; i < endpoints.length; i++) {
      const key = ['vesper', chain, i].join('/')
      const data = await getConfig(key, endpoints[i])
      data.forEach(pool => poolSet.add(pool.address)) // add pools from our contracts list
    }
    if (stakingPool) poolSet.delete(stakingPool)
    const poolList = [...poolSet]

    if (!poolList.length) return;

    // Get collateral token
    const tokens = await api.multiCall({ abi: 'address:token', calls: poolList })
    const bals = await api.multiCall({ abi: 'uint256:totalValue', calls: poolList })
    api.add(tokens, bals)
  }

  let staking

  if (stakingPool && VSP)
    staking = sumTokensExport({ owner: stakingPool, token: VSP })

  return {
    [chain]: { tvl, staking }
  }
}

module.exports = {
  start: '2020-12-22', // December 22 2020 at 8:00 PM UTC
  ...['ethereum', 'avax', 'polygon', 'optimism', 'base'].reduce((acc, chain) => ({ ...acc, ...getChainExports(chain) }), {})
};
