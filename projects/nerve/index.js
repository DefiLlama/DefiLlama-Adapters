/*==================================================
  Modules
  ==================================================*/

const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const _ = require('underscore')

/*==================================================
  Addresses
  ==================================================*/

const btcPoolAddress = 'bsc:0x6C341938bB75dDe823FAAfe7f446925c66E6270c'
const usdPoolAddress = 'bsc:0x1B3771a66ee31180906972580adE9b81AFc5fCDc'
const ethPoolAddress = 'bsc:0x146CD24dCc9f4EB224DFd010c5Bf2b0D25aFA9C0'
const xnrvAddress = 'bsc:0x15B9462d4Eb94222a7506Bc7A25FB27a2359291e'

const tokens = {
  // BUSD
  'bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56': [usdPoolAddress],
  // Binance Pegged USDC
  'bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': [usdPoolAddress],
  // Binance Pegged USDT
  'bsc:0x55d398326f99059ff775485246999027b3197955': [usdPoolAddress],
  // Binance Pegged BTC
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': [btcPoolAddress],
  // anyBTC
  '0x54261774905f3e6e9718f2abb10ed6555cae308a': [btcPoolAddress],
  // Binance Pegged ETH
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': [ethPoolAddress],
  // anyETH
  '0x6f817a0ce8f7640add3bc0c1c2298635043c2423': [ethPoolAddress],
  // NRV
  'bsc:0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096': [xnrvAddress],
}

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  let balances = {}
  let calls = []

  for (const token in tokens) {
    for (const poolAddress of tokens[token])
      calls.push({
        target: token,
        params: poolAddress,
      })
  }

  // Pool Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: calls,
    abi: 'erc20:balanceOf',
  })

  // Compute Balances
  _.each(balanceOfResults.output, (balanceOf) => {
    if (balanceOf.success) {
      let address = balanceOf.input.target
      balances[address] = BigNumber(balances[address] || 0)
        .plus(balanceOf.output)
        .toFixed()
    }
  })

  return balances
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: 'Nerve', // project name
  website: 'https://nerve.fi/',
  token: 'NRV', // null, or token symbol if project has a custom token
  category: 'dexes', // allowed values as shown on DefiPulse: 'Derivatives', 'DEXes', 'Lending', 'Payments', 'Assets'
  start: 1614556800, // March 1, 2021 00:00 AM (UTC)
  tvl, // tvl adapter
}
