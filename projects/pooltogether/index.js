const { default: BigNumber } = require('bignumber.js')
const v3 = require('./v3.js')
const v4 = require('./v4.js')

function mergeVersionTvls(tvls) {
  if (tvls.length === 0) return {}
  if (tvls.length === 1) return tvls[0]

  const result = { ...tvls[0] }

  for (let i = 1; i < tvls.length; i++) {
    Object.entries(tvls[i]).forEach(([address, balance]) => {
      if (result[address] === undefined) {
        result[address] = balance
      } else {
        const newBalance = BigNumber.sum(BigNumber(result[address]), BigNumber(balance))
        result[address] = newBalance.toString()
      }
    })
  }

  return result
}

async function ethereum(timestamp, block, chainBlocks) {
  const tvl_v3 = await v3.ethereum(timestamp, block, chainBlocks)
  const tvl_v4 = await v4.ethereum(timestamp, block, chainBlocks)
  return mergeVersionTvls([tvl_v3, tvl_v4])
}

async function polygon(timestamp, block, chainBlocks) {
  const tvl_v3 = await v3.polygon(timestamp, block, chainBlocks)
  const tvl_v4 = await v4.polygon(timestamp, block, chainBlocks)
  return mergeVersionTvls([tvl_v3, tvl_v4])
}

async function avax(timestamp, block, chainBlocks) {
  const tvl_v4 = await v4.avax(timestamp, block, chainBlocks)
  return tvl_v4
}

async function optimism(timestamp, block, chainBlocks) {
  const tvl_v4 = await v4.optimism(timestamp, block, chainBlocks)
  return tvl_v4
}

async function celo(timestamp, block, chainBlocks) {
  const tvl_v3 = await v3.celo(timestamp, block, chainBlocks)
  return tvl_v3
}

async function bsc(timestamp, block, chainBlocks) {
  const tvl_v3 = await v3.bsc(timestamp, block, chainBlocks)
  return tvl_v3
}

module.exports = {
  doublecounted: true,
  ethereum: { tvl: ethereum },
  polygon: { tvl: polygon },
  avax: { tvl: avax },
  optimism: { tvl: optimism },
  celo: { tvl: celo },
  bsc: { tvl: bsc },
  hallmarks: [
    [1_658_872_800, 'V4 OP Rewards Begin'],
    [1_669_615_200, 'V4 OP Rewards Extended']
  ],
  methodology: `TVL is the total tokens deposited in PoolTogether amongst V3, V4 and V5 on Ethereum, Polygon, Avalanche, Optimism, Celo and BSC`
}
