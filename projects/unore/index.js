const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");

// BSC pools
const riskPools = [
  '0xEcE9f1A3e8bb72b94c4eE072D227b9c9ba4cd750',
  '0x0b5C802ecA88161B5daed08e488C83d819a0cD02',
  '0x2cd32dF1C436f8dE6e09d1A9851945c56bcEd32a'
]

const bscTokens = ['0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'] // BUSD

// ETHEREUM pools
const ethTokens = [
  '0x474021845c4643113458ea4414bdb7fb74a01a77', // UNO
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7' // USDT
] 

// SSRP, SSIP pools(risk pools) on ethereum
const ethRiskPools = [
  '0x1eECc8C8298ed9Bd46c147D44E2D7A7BfACE2034', // UNO SSRP
  '0xbd3E70819A8Add92B06d6d92A06DcdA9249DF2a3',  // UNO SSIP
  '0x920d510d5c70c01989b66f4e24687dddb988ddae', // USDT SSIP
  '0xfdfaa453ef3709d2c26ecf43786a14ab8bf27e36' // USDC SSIP
]
const ethSSIPEth = '0x29B4b8674D93b36Bf651d0b86A8e5bE3c378aCF4'

// KAVA pools
// tokens
const kavaTokens = [
  // '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f', // USDC
]
// risk pools
const kavaRiskPools = [
  '0x6cEC77829F474b56c327655f3281739De112B019'
]

const kavaSSIPKava = '0x112a295B0fCd382E47E98E8271e45979EDf952b6'

function constructBalanceOfCalls(tokens, useAddressProp, pools) {
  const calls = []
  for (const router of pools) {
    for (const token of tokens) {
      const address = useAddressProp ? token.address : token
      calls.push({
        target: address,
        params: [router]
      })
    }
  }
  return calls
}

async function eth(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.ethereum
  const balances = {}
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    chain: 'ethereum',
    calls: constructBalanceOfCalls(ethTokens, false, ethRiskPools)
  })

  routerBalances.output.forEach(result => {
    sdk.util.sumSingleBalance(balances, `ethereum:${result.input.target}`, result.output)
  })

  let _ethBalance = await sdk.api.eth.getBalance({ target: ethSSIPEth })
  _ethBalance = BigNumber(_ethBalance.output).div(10 ** 18)

  balances['ethereum'] = _ethBalance

  return balances
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.bsc
  const balances = {}
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    chain: 'bsc',
    calls: constructBalanceOfCalls(bscTokens, false, riskPools)
  })
  routerBalances.output.forEach(result => {
    sdk.util.sumSingleBalance(balances, `bsc:${result.input.target}`, result.output)
  })
  return balances
}

async function kava(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.kava
  const balances = {}
  const routerBalances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    block,
    chain: 'kava',
    calls: constructBalanceOfCalls(kavaTokens, false, kavaRiskPools)
  })

  routerBalances.output.forEach(result => {
    sdk.util.sumSingleBalance(balances, `kava:${result.input.target}`, result.output)
  })

  let _kavaBalance = await sdk.api.eth.getBalance({ target: kavaSSIPKava, chain: 'kava' })
  _kavaBalance = BigNumber(_kavaBalance.output).div(10 ** 18)

  balances['kava'] = _kavaBalance

  return balances
}

module.exports = {
  start: 1632122867,  // Sep-20-2021 07:27:47 AM +UTC
  ethereum: {
    tvl: eth
  },
  bsc: {
    tvl: bsc
  },
  kava: {
    tvl: kava
  }
};
