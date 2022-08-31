const sdk = require('@defillama/sdk')
const { sumTokens2, unwrapLPsAuto } = require('../helper/unwrapLPs')
const { transformBalances } = require('../helper/portedTokens')
const { getParamCalls } = require('../helper/utils')
const { default: BigNumber } = require('bignumber.js')

async function ethV1(_, block) {
  const balances = {}
  const factory = '0xc517A08aeE9CA160a610752e50A6ED8087049091'
  const { output: count } = await sdk.api.abi.call({
    target: factory,
    abi: abi.count,
    block,
  })
  const poolCalls = getParamCalls(count)
  let { output: pools } = await sdk.api.abi.multiCall({
    target: factory,
    abi: abi.list,
    calls: poolCalls,
    block,
  })
  pools = pools.map(i => i.output)
  const calls = pools.map(i => ({ target: i}))
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.stakingTokens,
    calls, block,
  })
  const { output: totals } = await sdk.api.abi.multiCall({
    abi: abi.stakingTokens,
    calls, block,
  })

  tokens.forEach(({ output }, i) => {
    output.forEach((token, j) => {
      console.log(i, j, token, totals[i].output[j] / 1e36)
      sdk.util.sumSingleBalance(balances, token, BigNumber(totals[i].output[j] / 1e18).toFixed(0))
    })
  })

  await unwrapLPsAuto({ balances, block, })
  return balances
}



module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: sdk.util.sumChainTvls([ethV1])
  },
}

const abi = {
  count: {
    "inputs": [],
    "name": "count",
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
  list: {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "list",
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
  stakingTokens: {
    "inputs": [],
    "name": "stakingTokens",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  stakingTotals: {
    "inputs": [],
    "name": "stakingTotals",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}