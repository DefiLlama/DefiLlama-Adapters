const { sumTokens2 } = require('../helper/unwrappers')

// ALEF fund reserve addresses — all holdings are on-chain and publicly verifiable
const EVM_ADDR    = '0xfB6b384a64BA407Ee964DF70bf48A6Ef993B1Fd4' // Ethereum + BSC
const SOL_WALLETS = [
  '9W22wgpcSsbcAjoGvGQfcvVUns5q7LMuWNPCnM4eVXse',
  '9JRZdE4rcSUQRDRUTqNrqsFtxm7caT4GfyiNxFJqBHUe',
]
const TRON_ADDR   = 'TFMDSKrH2FJx3pdGACb5oHoKPJRzaH8dKv'
const BTC_ADDR    = 'bc1qmqcggscd9mfddzywukrxksrrfamx5mevr5jr40llmf6ggtdmwyeqcaekt4'

// ERC-20 tokens held by the fund on Ethereum
const ETH_TOKENS = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  '0x45804880de22913dafe09f4980848ece6ecbaf78', // PAXG (Pax Gold)
  '0x68749665ff8d2d112fa859aa293f07a622782f38', // XAUt (Tether Gold)
  '0x6c3ea9036406852006290770bedfcaba0e23a0e8', // PYUSD
  '0xa45cd7ac9865b9539166ebaf2abc362df4736580', // TQQQon (3× Nasdaq)
  '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', // cbBTC
]

async function bitcoinTvl(api) {
  const res = await fetch(`https://mempool.space/api/address/${BTC_ADDR}`)
  const data = await res.json()
  const satoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
  api.add('bitcoin', satoshis / 1e8)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of on-chain assets held across the fund\'s reserve addresses on Ethereum, BSC, Solana, Tron, and Bitcoin. All holdings are publicly verifiable on-chain. ALEF is an actively managed fund with adjustable market exposure; the fund runs internal leverage (~1.5×) via Aave, Venus, and JustLend.',
  ethereum: { tvl: (api) => sumTokens2({ api, owner: EVM_ADDR, tokens: ETH_TOKENS }) },
  bsc:      { tvl: (api) => sumTokens2({ api, owner: EVM_ADDR, fetchCoValentTokens: true }) },
  solana:   { tvl: (api) => sumTokens2({ api, owners: SOL_WALLETS, fetchCoValentTokens: true }) },
  tron:     { tvl: (api) => sumTokens2({ api, owner: TRON_ADDR, fetchCoValentTokens: true }) },
  bitcoin:  { tvl: bitcoinTvl },
}
