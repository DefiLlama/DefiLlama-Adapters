
const sdk = require('@defillama/sdk')
const { createIncrementArray } = require('../helper/utils')
const { sumTokens2 } = require('../helper/unwrapLPs')
const token0ABI = require('../helper/abis/token0.json')
const token1ABI = require('../helper/abis/token1.json')

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

const config = {
  kava: {
    nativeCoinGeckoId: 'kava',
    positionManager: '0x1Bf12f0650d8065fFCE3Cd9111feDEC21deF6825',
    customToken: '0xc13791DA84f43525189456CfE2026C60D3B7F706'.toLowerCase(),
  },
  aurora: {
    nativeCoinGeckoId: 'aurora',
    positionManager: '0x649Da64F6d4F2079156e13b38E95ffBF8EBB1B14',
    customToken: '0x274d83086C356E0cFc75933FBf838CA10A7E8274'.toLowerCase(),
  },
}

module.exports = {}

Object.keys(config).forEach(chain => {
  const { nativeCoinGeckoId, positionManager, customToken } = config[chain]
  module.exports[chain] = {
    tvl: async function tvl(_, _b, { [chain]: block }) {

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

      poolAddreses = poolAddreses.map(i => ({ target: i.output }))
      const { output: token0s } = await sdk.api.abi.multiCall({
        abi: token0ABI,
        calls: poolAddreses,
        chain, block,
      })
      const { output: token1s } = await sdk.api.abi.multiCall({
        abi: token1ABI,
        calls: poolAddreses,
        chain, block,
      })
      const toa = []
      token0s.forEach(({ input: { target }, output }) => toa.push([output, target]))
      token1s.forEach(({ input: { target }, output }) => toa.push([output, target]))
      const balances = await sumTokens2({ chain, block, tokensAndOwners: toa })
      const customKey = chain + ':' + customToken
      sdk.util.sumSingleBalance(balances, nativeCoinGeckoId, (balances[customKey] || 0) / 1e18)
      delete balances[customKey]
      return balances
    }
  }
})

