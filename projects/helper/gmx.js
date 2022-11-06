const { sumTokens2 } = require('./unwrapLPs')
const { getParamCalls, } = require('./utils')
const sdk = require('@defillama/sdk')

function gmxExports({ chain, vault, }) {
  return async (ts, _block, { [chain]: block }) => {
    const { output: numTokens } = await sdk.api.abi.call({
      target: vault,
      abi: abis.allWhitelistedTokensLength,
      chain, block,
    })
  
    const { output: tokenAddresses } = await sdk.api.abi.multiCall({
      target: vault,
      abi: abis.allWhitelistedTokens,
      calls: getParamCalls(numTokens),
      chain, block,
    })
  
    return sumTokens2({ owner: vault, tokens: tokenAddresses.map(i => i.output), chain, block,})
  }
}

const abis = {
  "allWhitelistedTokensLength":{
    "inputs": [],
    "name": "allWhitelistedTokensLength",
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
  "allWhitelistedTokens": {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allWhitelistedTokens",
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

module.exports = {
  gmxExports
}
