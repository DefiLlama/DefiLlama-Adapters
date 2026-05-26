const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumTokens2: solanaSumTokens } = require('../helper/solana')

// TurboFlow TVL = USDT/USDC held in (1) on-chain bridge contracts on BSC and
// Solana that receive user deposits, plus (2) Fireblocks MPC custody wallets
// that back user deposits and settlement obligations.
//
// All addresses below are on-chain verifiable and listed publicly by the
// protocol. No off-chain HTTP source is involved in TVL computation.

// --- BSC ---

const BSC_HOLDERS = [
  '0x145CD0d5C3dD0eF1405dCf1b4D2BCE7c611625dB', // Bridge contract (user deposits)
  '0x8757f9E16d775759671e95e50D749CECCDA375AE', // Fireblocks MPC vault (SIG)
  '0x077Ab3f5D4372cA14c6AA417215Af3d91B55bAFc', // Fireblocks MPC vault (TFUSERS)
]

const BSC_TOKENS = [
  ADDRESSES.bsc.USDT, // 0x55d398326f99059fF775485246999027B3197955
  ADDRESSES.bsc.USDC, // 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
]

async function bscTvl(api) {
  return sumTokens2({ api, owners: BSC_HOLDERS, tokens: BSC_TOKENS })
}

// --- Solana ---

// Bridge custody — direct SPL token accounts owned by the bridge program
// (authority PDA: 8iquHJQyXUq8ykTEKZjtS4wSHKnxiw4ghGWUNzPnA9Q4).
const SOLANA_BRIDGE_TOKEN_ACCOUNTS = [
  '9ayXbTyhkJ49WtG6DA2PCN6EAKtM8DCneMzhJPTMRWcj', // Bridge USDC SPL account
  '6hVp2UaWWQwGo2c6yHj39WJWDNenR48GsLGKPzSa7EU2', // Bridge USDT SPL account
]

// Fireblocks MPC custody — owner wallet pubkeys. The Solana helper derives
// each owner's associated token accounts for the listed mints automatically.
const SOLANA_FIREBLOCKS_OWNERS = [
  '6FaXzEC4CNAh1ECxc8FUnjpcnMYYG4M7DVJ5ZMbTmcWH', // Fireblocks vault (SIG)
  '4wHLLe6ovPqmGoBjvk6ogxgFbiGMCUUPvnMqmxyprX5C', // Fireblocks vault (TFUSERS)
]

const SOLANA_FIREBLOCKS_PAIRS = SOLANA_FIREBLOCKS_OWNERS.flatMap((owner) => [
  [ADDRESSES.solana.USDT, owner],
  [ADDRESSES.solana.USDC, owner],
])

async function solanaTvl(api) {
  // `computeTokenAccount: true` tells the helper to locally derive the
  // canonical associated token account (ATA) for each (mint, owner) pair
  // in `tokensAndOwners`, then read those accounts via `getMultipleAccounts`
  // instead of issuing `getTokenAccountsByOwner` requests (which public
  // Solana RPCs throttle aggressively from shared CI egress IPs).
  //
  // `allowError: true` tolerates Fireblocks ATAs that have not yet been
  // initialised on chain (i.e. zero deposits to date): the helper treats
  // a missing account as a zero balance instead of throwing.
  return solanaSumTokens({
    api,
    tokenAccounts: SOLANA_BRIDGE_TOKEN_ACCOUNTS,
    tokensAndOwners: SOLANA_FIREBLOCKS_PAIRS,
    computeTokenAccount: true,
    allowError: true,
  })
}

module.exports = {
  methodology:
    'TVL counts USDT and USDC balances held by TurboFlow on (i) on-chain bridge contracts on BSC and Solana that receive user deposits, and (ii) protocol-operated MPC custody wallets (Fireblocks) that back user deposits and settlement obligations. All custody addresses are listed in this adapter and verifiable on-chain via balanceOf (BSC) and getTokenAccountBalance / getTokenAccountsByOwner (Solana). Excludes trading volume, leveraged notional exposure, unrealized PnL, treasury, and operating funds not allocated to user deposit backing.',
  start: '2025-10-19',
  bsc: { tvl: bscTvl },
  solana: { tvl: solanaTvl },
}
