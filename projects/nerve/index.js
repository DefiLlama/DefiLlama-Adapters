const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')
const _ = require('underscore')
const { staking } = require('../helper/staking')
const {unwrapCrv} = require('../helper/unwrapLPs')

/*==================================================
  Addresses
  ==================================================*/

const btcPoolAddress = '0x6C341938bB75dDe823FAAfe7f446925c66E6270c'
const usdPoolAddress = '0x1B3771a66ee31180906972580adE9b81AFc5fCDc'
const ethPoolAddress = '0x146CD24dCc9f4EB224DFd010c5Bf2b0D25aFA9C0'
const xnrvAddress = '0x15B9462d4Eb94222a7506Bc7A25FB27a2359291e'
const rusdPoolAddress = '0x0eafaa7ed9866c1f08ac21dd0ef3395e910f7114'
const fusdtPoolAddress = '0xd0fBF0A224563D5fFc8A57e4fdA6Ae080EbCf3D3'
const ustPoolAddress = '0x2dcCe1586b1664f41C72206900e404Ec3cA130e0'
const nrv3 = '0xf2511b5e4fb0e5e2d123004b672ba14850478c14'
const nrv = "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096"

const tokens = {
  // BUSD
  '0xe9e7cea3dedca5984780bafc599bd69add087d56': [usdPoolAddress],
  // Binance Pegged USDC
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': [usdPoolAddress],
  // Binance Pegged USDT
  '0x55d398326f99059ff775485246999027b3197955': [usdPoolAddress],
  // rUSD 
  '0x07663837218a003e66310a01596af4bf4e44623d': [rusdPoolAddress],
  // 3NRV-LP
  //'0xf2511b5e4fb0e5e2d123004b672ba14850478c14': [rusdPoolAddress],
  // Binance Pegged BTC
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': [btcPoolAddress],
  // anyBTC
  '0x54261774905f3e6e9718f2abb10ed6555cae308a': [btcPoolAddress],
  // Binance Pegged ETH
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8': [ethPoolAddress],
  // anyETH
  '0x6f817a0ce8f7640add3bc0c1c2298635043c2423': [ethPoolAddress],
  // FUSDT
  '0x049d68029688eabf473097a2fc38ef61633a3c7a': [fusdtPoolAddress],
  // 3NRV-LP
  '0xf2511b5e4fb0e5e2d123004b672ba14850478c14': [fusdtPoolAddress],
  // UST
  '0x23396cf899ca06c4472205fc903bdb4de249d6fc': [ustPoolAddress],  
}

async function tvl(timestamp, block, chainBlocks) {
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
    block:chainBlocks['bsc'],
    calls: calls,
    abi: 'erc20:balanceOf',
    chain: 'bsc'
  })

  // Compute Balances
  _.each(balanceOfResults.output, (balanceOf) => {
      let address = `bsc:${balanceOf.input.target}`.toLowerCase();
      if(address === "bsc:0x54261774905f3e6e9718f2abb10ed6555cae308a"){
        balances["bitcoin"] = Number(balanceOf.output)/1e8
        return;
      } else if(address === "bsc:0x6f817a0ce8f7640add3bc0c1c2298635043c2423"){
        address = "bsc:0x2170ed0880ac9a755fd29b2688956bd959f933f8"
      } else if(address === "bsc:0x07663837218a003e66310a01596af4bf4e44623d" || address === 'bsc:0x049d68029688eabf473097a2fc38ef61633a3c7a'){ // fusdt and rusd
        address = "0x6b175474e89094c44da98b954eedeac495271d0f"
      }
      balances[address] = BigNumber(balances[address] || 0)
        .plus(balanceOf.output)
        .toFixed()
  })
  await unwrapCrv(balances, nrv3, balances['bsc:'+nrv3], chainBlocks['bsc'], 'bsc', (addr)=>`bsc:${addr}`)
  delete balances['bsc:'+nrv3];

  return balances
}

module.exports = {
  timetravel: true,
  start: 1614556800, // March 1, 2021 00:00 AM (UTC)
  bsc:{
    tvl,
    staking:staking(xnrvAddress, nrv, "bsc")
  }
}
