const sdk = require('@defillama/sdk');
const { sumTokens2, } = require('../helper/unwrapLPs')

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
  '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f', // USDC
]
// risk pools
const kavaRiskPools = [
  '0x6cEC77829F474b56c327655f3281739De112B019'
]

const kavaSSIPKava = '0x112a295B0fCd382E47E98E8271e45979EDf952b6'

async function eth(timestamp, block) {
  const balances = {}

  let _ethBalance = await sdk.api.eth.getBalance({ target: ethSSIPEth, block })
  balances['ethereum'] = _ethBalance.output / 1e18

  return sumTokens2({ balances, block, owners: ethRiskPools, tokens: ethTokens })
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  const chain = 'bsc'
  const block = chainBlocks[chain]
  return sumTokens2({ chain, block, owners: riskPools, tokens: bscTokens })
}

async function kava(timestamp, ethBlock, chainBlocks) {
  const chain = 'kava'
  const block = chainBlocks[chain]
  const balances = {}

  let _kavaBalance = await sdk.api.eth.getBalance({ target: kavaSSIPKava, chain, block })
  balances['kava'] = _kavaBalance.output / 1e18

  return sumTokens2({ balances, chain, block, owners: kavaRiskPools, tokens: kavaTokens })
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
