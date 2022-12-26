
const { getUniTVL } = require('./helper/unknownTokens')
const { createIncrementArray } = require('./helper/utils')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('./helper/unwrapLPs')
const swapFactory = '0x1b8e12f839bd4e73a47addf76cf7f0097d74c14c'
const stableSwapFactory = '0xc6e111637440d1fe9c1ee45d5a1239771b267122'

const abis = {
  allPools: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allPools",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  allPoolsLength: {
    "inputs": [],
    "name": "allPoolsLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getTokenLength: {
    "inputs": [],
    "name": "getTokenLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getToken: {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "index",
        "type": "uint8"
      }
    ],
    "name": "getToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}

const bscDexTVL = getUniTVL({
  chain: 'bsc',
  factory: swapFactory,
})

async function bscStableSwapTvl(_, _b, { bsc: block }) {
  const chain = 'bsc'
  const { output: poolLength } = await sdk.api.abi.call({
    target: stableSwapFactory,
    abi: abis.allPoolsLength,
    chain, block,
  })

  const params = createIncrementArray(poolLength).map(i => ({ params: i }))

  const { output: pools } = await sdk.api.abi.multiCall({
    target: stableSwapFactory,
    abi: abis.allPools,
    calls: params,
    chain, block,
  })

  const { output: tokenLength } = await sdk.api.abi.multiCall({
    abi: abis.getTokenLength,
    calls: pools.map(i => ({ target: i.output })),
    chain, block,
  })

  const tokenCalls = []
  tokenLength.forEach(i => {
    createIncrementArray(i.output).forEach(j => tokenCalls.push({ target: i.input.target, params: j }))
  })

  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abis.getToken,
    calls: tokenCalls,
    chain, block,
  })

  const toa = tokens.map(i => ([i.output, i.input.target]))
  return sumTokens2({ tokensAndOwners: toa, chain, block })
}

module.exports = {
  bsc: {
    tvl: sdk.util.sumChainTvls([bscDexTVL, bscStableSwapTvl]),
  }
}
