const sdk = require("@defillama/sdk")
const { sumTokens2 } = require('../helper/unwrapLPs')

async function getPools(block) {
  const pools = []
  const poolFactory = '0x312853485a41f76f20a14f927cd0ea676588936c'
  const logs = await sdk.api.util.getLogs({
    keys: [],
    toBlock: block,
    target: poolFactory,
    fromBlock: 15598950,
    topic: 'PoolCreated(address,address,address)',
  })
  logs.output.forEach((log) => {
    const pool = `0x${log.topics[1].substring(26)}`.toLowerCase();
    const currency = `0x${log.topics[3].substring(26)}`.toLowerCase();
    pools.push({ pool, currency })
  })
  return pools
}

async function tvl(_, block) {
  const pools = await getPools(block)
  const tokensAndOwners = pools.map(i => ([i.currency, i.pool]))
  return sumTokens2({ block, tokensAndOwners })
}

async function borrowed(_, block) {
  const pools = await getPools(block)
  const calls = pools.map(i => ({ target: i.pool }))
  const abi = {
    "inputs": [],
    "name": "borrows",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
  const { output: borrows } = await sdk.api.abi.multiCall({
    abi, calls, block,
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
