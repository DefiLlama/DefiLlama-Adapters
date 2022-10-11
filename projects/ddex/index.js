const sdk = require('@defillama/sdk');
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')
const { createIncrementArray, getUniqueAddresses } = require('../helper/utils')
const ddexMarginContractAddress = '0x241e82c79452f51fbfc89fac6d912e021db1a3b7'
const SAI = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'

async function tvl(timestamp, block) {
  const tokens = []
  const { output: marketCount } = await sdk.api.abi.call({
    target: ddexMarginContractAddress,
    abi: abis.getAllMarketsCount, block,
  })
  const { output: res } = await sdk.api.abi.multiCall({
    target: ddexMarginContractAddress,
    abi: abis.getMarket,
    calls: createIncrementArray(marketCount).map(i => ({ params: i })),block,
  })
  res.forEach(({ output: [base, quote] }) => tokens.push(base, quote))
  tokens.forEach((t, i) => {
    if (t === '0x000000000000000000000000000000000000000E')
      tokens[i] = nullAddress
  })
  return sumTokens2({ owner: ddexMarginContractAddress, tokens: getUniqueAddresses(tokens), block, blacklistedTokens: [SAI] })
}

module.exports = {
  start: 1566470505, // 2019-08-22T18:41:45+08:00
  ethereum: { tvl }
}

const abis = {
  getMarket: {
    "constant": true,
    "inputs": [
      {
        "name": "marketID",
        "type": "uint16"
      }
    ],
    "name": "getMarket",
    "outputs": [
      {
        "components": [
          {
            "name": "baseAsset",
            "type": "address"
          },
          {
            "name": "quoteAsset",
            "type": "address"
          },
          {
            "name": "liquidateRate",
            "type": "uint256"
          },
          {
            "name": "withdrawRate",
            "type": "uint256"
          },
          {
            "name": "auctionRatioStart",
            "type": "uint256"
          },
          {
            "name": "auctionRatioPerBlock",
            "type": "uint256"
          },
          {
            "name": "borrowEnable",
            "type": "bool"
          }
        ],
        "name": "market",
        "type": "tuple"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  getAllMarketsCount: {
    "constant": true,
    "inputs": [],
    "name": "getAllMarketsCount",
    "outputs": [
      {
        "name": "count",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
}