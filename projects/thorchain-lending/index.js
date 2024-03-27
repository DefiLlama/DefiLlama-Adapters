const { getCache, get } = require('../helper/http')
const sdk = require('@defillama/sdk')

const chainMapping = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
}

function getDChain(chain) {
  return chainMapping[chain]
}

const blacklistedPools = []

async function debtIssued(_, _1, _2, { api }) {
  const pools = await getCache('https://midgard.ninerealms.com/v2/pools')
  const aChain = api.chain

  const balances = {}
  const poolsWithLending = pools.filter(pool => Number(pool.totalDebtTor) > 0)
  await Promise.all(poolsWithLending.map(addPool))
  return balances

  async function addPool({ asset: pool, totalDebtTor }) {
    if (blacklistedPools.includes(pool)) return;

    let [chainStr,] = pool.split('.')
    const dChain = getDChain(chainStr)
    if (dChain !== aChain) return;

    totalDebtTor = totalDebtTor / 1e2
    sdk.util.sumSingleBalance(balances, '0xdac17f958d2ee523a2206206994597c13d831ec7', totalDebtTor)
  }
}

module.exports = {
  hallmarks: [
    [1626656400, "Protocol paused"],
    [1631754000, "Protocol resumed"],
  ],
  timetravel: false,
  thorchain: {
    tvl: debtIssued,
  },
}

Object.keys(chainMapping).map(getDChain).forEach(chain => {
  module.exports[chain] = {tvl: debtIssued}
})
