const sdk = require("@defillama/sdk")
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function getPools(api) {
  const pools = []
  const poolFactory = '0x312853485a41f76f20a14f927cd0ea676588936c'
  const logs = await getLogs({
    api,
    target: poolFactory,
    fromBlock: 15598950,
    topic: 'PoolCreated(address,address,address)',
  })
  logs.forEach((log) => {
    const pool = `0x${log.topics[1].substring(26)}`.toLowerCase();
    const currency = `0x${log.topics[3].substring(26)}`.toLowerCase();
    pools.push({ pool, currency })
  })
  return pools
}

async function tvl(api) {
  const block = api.block
  const pools = await getPools(api)
  const tokensAndOwners = pools.map(i => ([i.currency, i.pool]))
  return sumTokens2({ block, tokensAndOwners })
}

async function borrowed(api) {
  const pools = await getPools(api)
  const calls = pools.map(i => ({ target: i.pool }))
  const { output: borrows } = await sdk.api.abi.multiCall({
    abi: "uint256:borrows", calls, block: api.block,
  })
  const balances = {}
  borrows.forEach(({ output, }, i) => sdk.util.sumSingleBalance(balances, pools[i].currency, output ))
  return balances
}

module.exports = {
  ethereum: {
    tvl, borrowed,
  },
}
