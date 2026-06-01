const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumTokens2: solanaSumTokens } = require('../helper/solana')

// TurboFlow TVL = USDT/USDC held in the on-chain bridge contracts that
// receive user deposits on BSC and Solana. Protocol-operated MPC custody
// wallets (Fireblocks) that back user deposits and settlement obligations
// are tracked separately as treasury in `projects/treasury/turboflow.js`,
// per DefiLlama's policy of not counting EOA/safe balances toward TVL.

// --- BSC ---

const BSC_BRIDGE = '0x145CD0d5C3dD0eF1405dCf1b4D2BCE7c611625dB'

const BSC_TOKENS = [
  ADDRESSES.bsc.USDT, // 0x55d398326f99059fF775485246999027B3197955
  ADDRESSES.bsc.USDC, // 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
]

async function bscTvl(api) {
  return sumTokens2({ api, owner: BSC_BRIDGE, tokens: BSC_TOKENS })
}

// --- Solana ---

// Bridge custody — direct SPL token accounts owned by the bridge program
// (authority PDA: 8iquHJQyXUq8ykTEKZjtS4wSHKnxiw4ghGWUNzPnA9Q4).
const SOLANA_BRIDGE_TOKEN_ACCOUNTS = [
  '9ayXbTyhkJ49WtG6DA2PCN6EAKtM8DCneMzhJPTMRWcj', // Bridge USDC SPL account
  '6hVp2UaWWQwGo2c6yHj39WJWDNenR48GsLGKPzSa7EU2', // Bridge USDT SPL account
]

async function solanaTvl(api) {
  return solanaSumTokens({
    api,
    tokenAccounts: SOLANA_BRIDGE_TOKEN_ACCOUNTS,
  })
}

module.exports = {
  methodology:
    'TVL counts USDT and USDC balances held by the TurboFlow bridge contracts on BSC and Solana, which are the on-chain entry points for user deposits. Protocol-operated MPC custody (Fireblocks) backing user deposits is tracked separately as treasury (see projects/treasury/turboflow.js), in line with DefiLlama policy of not counting EOA/safe balances toward TVL. Excludes trading volume, leveraged notional exposure, unrealized PnL, and any non-circulating tokens.',
  start: '2025-10-19',
  bsc: { tvl: bscTvl },
  solana: { tvl: solanaTvl },
}
