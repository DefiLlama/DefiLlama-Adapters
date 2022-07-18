
const sdk = require('@defillama/sdk')
const { createIncrementArray } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')

const abis = {
  "poolsCount": {
    "inputs": [],
    "name": "poolsCount",
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
  "poolsAddresses": {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "poolsAddresses",
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
  token0:
  {
    "inputs": [],
    "name": "protocolFees",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "token0",
        "type": "uint128"
      },
      {
        "internalType": "uint128",
        "name": "token1",
        "type": "uint128"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  token1:
  {
    "inputs": [],
    "name": "token1",
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
}
const chain = 'kava'
const positionManager = '0x1Bf12f0650d8065fFCE3Cd9111feDEC21deF6825'
const customWKava = '0xc13791DA84f43525189456CfE2026C60D3B7F706'.toLowerCase()

async function tvl(_, _b, { [chain]: block }) {
  const { output: poolCount } = await sdk.api.abi.call({
    target: positionManager,
    abi: abis.poolsCount,
    chain, block,
  })
  const calls = createIncrementArray(poolCount).map(i => ({ params: i }))
  let { output: poolAddreses } = await sdk.api.abi.multiCall({
    target: positionManager,
    abi: abis.poolsAddresses,
    calls,
    chain, block,
  })

  poolAddreses = poolAddreses.map(i => i.output)
  const kavaBal = await sumTokens2({ chain, block, tokens: [customWKava], owners: poolAddreses, transformAddress: a => a, })

  return {
    kava: kavaBal[customWKava] / 1e18
  }
}

module.exports = {
  kava: {
    tvl
  }
}
