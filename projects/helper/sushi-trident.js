const sdk = require('@defillama/sdk');
const { sumTokens2, } = require('./unwrapLPs')
const { log } = require('./utils')

function getTridentTVLFromFactories({ chain, factories}) {
  return async (ts, _block, { [chain]: block }) => {
    const toa = []
    for (let factory of factories) {
      const pairLength = (await sdk.api.abi.call({ target: factory, abi: abis.totalPoolsCount, chain, block })).output
      if (pairLength === null)
        throw new Error("allPairsLength() failed")

      log(chain, ' No. of pairs: ', pairLength)

      let pairNums = Array.from(Array(Number(pairLength)).keys())
      let pairs = (await sdk.api.abi.multiCall({ abi: abis.getPoolAddress, chain, calls: pairNums.map(num => ({ target: factory, params: [num] })), block })).output
      const pairCalls = pairs.map(result => ({target: result.output}))
      const { output: tokens } = await sdk.api.abi.multiCall({
        abi: abis.getAssets,
        calls: pairCalls,
        chain, block,
      })
      tokens.forEach(({ output, input: { target } }) => output.forEach(t => toa.push([t, target])))
    }
    return sumTokens2({ chain, block, tokensAndOwners: toa })
  }
}

function getTridentTVL({ chain, factory}) {
  return async (ts, _block, { [chain]: block }) => {
    const pairLength = (await sdk.api.abi.call({ target: factory, abi: abis.totalPoolsCount, chain, block })).output
    if (pairLength === null)
      throw new Error("allPairsLength() failed")

    log(chain, ' No. of pairs: ', pairLength)

    let pairNums = Array.from(Array(Number(pairLength)).keys())
    let pairs = (await sdk.api.abi.multiCall({ abi: abis.getPoolAddress, chain, calls: pairNums.map(num => ({ target: factory, params: [num] })), block })).output
    const pairCalls = pairs.map(result => ({target: result.output}))
    const { output: tokens } = await sdk.api.abi.multiCall({
      abi: abis.getAssets,
      calls: pairCalls,
      chain, block,
    })

    const toa = []
    tokens.forEach(({ output, input: { target } }) => output.forEach(t => toa.push([t, target])))
    return sumTokens2({ chain, block, tokensAndOwners: toa })
  }
}

// taken from https://github.com/pangea-protocol/pangea-core/tree/main/deployments/abis
const abis = {
  totalPoolsCount: {
    "inputs": [],
    "name": "totalPoolsCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "total",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getPoolAddress: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "idx",
        "type": "uint256"
      }
    ],
    "name": "getPoolAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "pool",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getAssets: {
    "inputs": [],
    "name": "getAssets",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "assets",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}

module.exports = {
  getTridentTVLFromFactories,
  getTridentTVL,
}
