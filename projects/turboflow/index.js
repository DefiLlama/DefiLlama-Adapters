const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { sumTokensExport: solanaSumTokensExport } = require('../helper/solana')

// TurboFlow TVL = USDT/USDC held in (1) on-chain bridge contracts on BSC and
// Solana that receive user deposits, plus (2) Fireblocks MPC custody wallets
// that back user deposits and settlement obligations.

const BSC_HOLDERS = [
  '0x145CD0d5C3dD0eF1405dCf1b4D2BCE7c611625dB', // Bridge contract (user deposits)
  '0x8757f9E16d775759671e95e50D749CECCDA375AE', // Fireblocks MPC vault (SIG)
  '0x077Ab3f5D4372cA14c6AA417215Af3d91B55bAFc', // Fireblocks MPC vault (TFUSERS)
]

// TAs owned by the bridge program (authority PDA: 8iquHJQyXUq8ykTEKZjtS4wSHKnxiw4ghGWUNzPnA9Q4) and MPC wallets (6FaXzEC4CNAh1ECxc8FUnjpcnMYYG4M7DVJ5ZMbTmcWH and 4wHLLe6ovPqmGoBjvk6ogxgFbiGMCUUPvnMqmxyprX5C).
const SOLANA_BRIDGE_TOKEN_ACCOUNTS = [
  '9ayXbTyhkJ49WtG6DA2PCN6EAKtM8DCneMzhJPTMRWcj', // Bridge USDC SPL account
  '6hVp2UaWWQwGo2c6yHj39WJWDNenR48GsLGKPzSa7EU2', // Bridge USDT SPL account
  '2ZEku38cWzGqMzhKG6tnpC42godiy8hjGFMZwf7uvPTc', // Fireblocks vault (SIG) USDC SPL account
  'FYmWdMq9KT87jpZomMQR7Y2r4a2KbEiXkoDJcHMAP1vq', // Fireblocks vault (SIG) USDT SPL account
  '3uCQ76uwDRur1udh4EPjzN84K2vrrcnyH2AnuUjFWNAF', // Fireblocks vault (TFUSERS) USDC SPL account
  '8ckjipCeccH3RrcPyXU8xCBGHRK9qgSPuU47ZfBKWGKC', // Fireblocks vault (TFUSERS) USDT SPL account
]

module.exports = {
  methodology:
    'TVL counts USDT and USDC balances held by TurboFlow on (i) on-chain bridge contracts on BSC and Solana that receive user deposits, and (ii) protocol-operated MPC custody wallets (Fireblocks) that back user deposits and settlement obligations.',
  start: '2025-10-19',
  bsc: { tvl: sumTokensExport({owners: BSC_HOLDERS, tokens: [ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT]}) },
  solana: { tvl: solanaSumTokensExport({tokenAccounts: SOLANA_BRIDGE_TOKEN_ACCOUNTS}) },
}