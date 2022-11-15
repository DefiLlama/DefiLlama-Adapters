const { get } = require('../helper/http');
const sdk = require('@defillama/sdk')
const chain = 'bsc'
const { sumTokens2 } = require('../helper/unwrapLPs')
const { PromisePool } = require('@supercharge/promise-pool')

const abis = {
  wrapped_coins: {
    "stateMutability": "view",
    "type": "function",
    "name": "wrapped_coins",
    "inputs": [
      {
        "name": "arg0",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "gas": 3345
  },
  coins: {
    "stateMutability": "view",
    "type": "function",
    "name": "coins",
    "inputs": [
      {
        "name": "arg0",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "gas": 3375
  },
}

async function tvl(_, _b, { [chain]: block }) {
  const tokensAndOwners = []
  const poolInfo = await get('https://api.ellipsis.finance/api/getPoolsCrypto')
  const wrappedCoinPools = [
    '0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d'
  ].map(i => i.toLowerCase())
  const lpTokens = poolInfo.data.allPools.map(i => i.lpToken.address.toLowerCase())
  const { errors } = await PromisePool.withConcurrency(20)
    .for(poolInfo.data.allPools)
    .process(async pool => {
      const target = pool.address.toLowerCase()
      let abi = !wrappedCoinPools.includes(target) ? abis.coins : abis.wrapped_coins
      try {
        for (let i = 0; i < pool.tokens.length; i++) {
          const { output: token } = await sdk.api.abi.call({
            target, abi, chain, block, params: [i]
          })
          addToken(token, target)
        }
      } catch {
        abi = abi === abis.wrapped_coins ? abis.coins : abis.wrapped_coins
        for (let i = 0; i < pool.tokens.length; i++) {
          const { output: token } = await sdk.api.abi.call({
            target, abi, chain, block, params: [i]
          })
          addToken(token, target)
        }
      }
    })
  if (errors && errors.length)
    throw errors[0]

  function addToken(token, owner) {
    token = token.toLowerCase()
    if (lpTokens.includes(token)) return;
    tokensAndOwners.push([token, owner])
  }
  return sumTokens2({
    chain, block, tokensAndOwners,
  })

}

const lockedSupply = { "inputs": [], "name": "lockedSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
const stakingContract = "0x4076cc26efee47825917d0fec3a79d0bb9a6bb5c"
const eps = "0xa7f552078dcc247c2684336020c03648500c6d9f"
async function staking(time, ethBlock, chainBlocks) {
  const locked = await sdk.api.abi.call({
    target: stakingContract,
    block: chainBlocks.bsc,
    chain: 'bsc',
    abi: lockedSupply
  })
  return {
    ["bsc:" + eps]: locked.output
  }
}

module.exports = {
  bsc: {
    tvl,
    staking
  }
}
