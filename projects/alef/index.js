const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumTokens2: solanaSumTokens2 } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

const EVM_ADDR    = '0xfB6b384a64BA407Ee964DF70bf48A6Ef993B1Fd4' // Ethereum + BSC
const SOL_WALLETS = [
  '9W22wgpcSsbcAjoGvGQfcvVUns5q7LMuWNPCnM4eVXse',
  '9JRZdE4rcSUQRDRUTqNrqsFtxm7caT4GfyiNxFJqBHUe',
]
const TRON_ADDR = 'TFMDSKrH2FJx3pdGACb5oHoKPJRzaH8dKv'
const BTC_ADDR  = 'bc1qmqcggscd9mfddzywukrxksrrfamx5mevr5jr40llmf6ggtdmwyeqcaekt4'

const ETH_TOKENS = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  '0x45804880de22913dafe09f4980848ece6ecbaf78', // PAXG
  '0x68749665ff8d2d112fa859aa293f07a622782f38', // XAUt
  '0x6c3ea9036406852006290770bedfcaba0e23a0e8', // PYUSD
  '0xa45cd7ac9865b9539166ebaf2abc362df4736580', // TQQQon
  '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', // cbBTC
]

const BSC_TOKENS = [
  ADDRESSES.null,                                        // BNB (native)
  '0x55d398326f99059ff775485246999027b3197955',          // USDT
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',          // USDC
  '0x02fca66c1d1afb4e2a7884261eb00f63598a7436',          // NVDAB
  '0x5b1910eaad6450e50f816082aa078c41f10c292f',          // TSLAB
  '0x7425889fe94f9d693e8daefe88bcced6acfef4c0',          // METAB
  '0x3f53de71c126bdabae20f9cd64848d317f6c3238',          // GOOGLB
  '0x8b872732b07be325a8803cdb480d9d20b6f8d11b',          // SLVon
]

const TRON_TOKENS = [
  ADDRESSES.tron.null,  // TRX (native)
  ADDRESSES.tron.USDT,  // USDT on Tron
]

async function bitcoinTvl(api) {
  const res = await fetch(`https://mempool.space/api/address/${BTC_ADDR}`)
  const data = await res.json()
  const satoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
  api.addCGToken('bitcoin', satoshis / 1e8)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the sum of on-chain assets held across the fund\'s reserve addresses on Ethereum, BSC, Solana, Tron, and Bitcoin. All holdings are publicly verifiable on-chain. ALEF is an actively managed fund with adjustable market exposure; the fund runs internal leverage (~1.5×) via Aave, Venus, and JustLend.',
  ethereum: { tvl: (api) => sumTokens2({ api, owner: EVM_ADDR, tokens: ETH_TOKENS }) },
  bsc:      { tvl: (api) => sumTokens2({ api, owner: EVM_ADDR, tokens: BSC_TOKENS }) },
  solana:   { tvl: (api) => solanaSumTokens2({ api, owners: SOL_WALLETS, solOwners: SOL_WALLETS }) },
  tron:     { tvl: (api) => sumTokens2({ api, owner: TRON_ADDR, tokens: TRON_TOKENS }) },
  bitcoin:  { tvl: bitcoinTvl },
}
