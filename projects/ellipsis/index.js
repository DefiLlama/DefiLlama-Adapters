const { createIncrementArray } = require('../helper/utils');
const { get } = require('../helper/http');
const sdk = require('@defillama/sdk')
const chain = 'bsc'
const { sumTokens2 } = require('../helper/unwrapLPs')

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
  const poolInfo = await get('https://api.ellipsis.finance/api/getPoolsCrypto')
  const lpTokens = poolInfo.data.allPools.map(i => i.lpToken.address)
  const pools = poolInfo.data.allPools.map(i => i.address)
  const tokensAndOwners = []
  const params = createIncrementArray(3)
  const wrappedCoinCalls = []
  const coinCalls = []
  pools.forEach(pool => {
    params.forEach(i => {
      wrappedCoinCalls.push({ target: pool, params: [i]})
      coinCalls.push({ target: pool, params: [i]})
    })
  })

  const { output: wrappedCoins } = await sdk.api.abi.multiCall({
    abi: abis.wrapped_coins,
    calls: wrappedCoinCalls,
    chain, block,
  })

  const { output: coins } = await sdk.api.abi.multiCall({
    abi: abis.coins,
    calls: coinCalls,
    chain, block,
  })

  wrappedCoins.forEach(i => {
    if (i.output) tokensAndOwners.push([i.output, i.input.target])
  })
  coins.forEach(i => {
    if (i.output) tokensAndOwners.push([i.output, i.input.target])
  })

  return sumTokens2({
    chain, block, tokensAndOwners, blacklistedTokens: lpTokens,
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
