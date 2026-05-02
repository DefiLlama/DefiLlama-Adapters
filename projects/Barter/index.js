// DefiLlama TVL adapter — Barter Superposition (USDC/USDT)
//
// Barter Superposition is non-custodial: LPs hold their own tokens and
// approve them to the Superposition contract. The router fills orders against
// LP wallet balances; no tokens are ever deposited into a shared pool.
//
// TVL = Σ min(allowance, balance) for USDC + USDT per LP wallet
//   — only wallets that have approved BOTH tokens are counted
//   — "deposit" = granting an approval, "withdrawal" = revoking it
//
// LP discovery: Approval(owner, spender=VAULT) events on USDC and USDT.
// getLogs caches these incrementally, so only new blocks are fetched each run.

const { getLogs } = require('../helper/cache/getLogs')

const VAULT = '0x69355223a0ce30aee41d353387c3082e5aafc4da'
const USDC  = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const USDT  = '0xdac17f958d2ee523a2206206994597c13d831ec7'

const START_BLOCK = 24621188  // SuperpositionVault deploy block

// keccak256("Approval(address,address,uint256)")
const APPROVAL_SIG = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
// vault address zero-padded to 32 bytes (for indexed topic filtering)
const VAULT_TOPIC  = '0x000000000000000000000000' + VAULT.slice(2).toLowerCase()

const APPROVAL_ABI = 'event Approval(address indexed owner, address indexed spender, uint256 value)'

async function tvl(api) {
  // Scan Approval(owner, vault) events on USDC and USDT.
  // The topics array filters to only vault approvals — avoids fetching the
  // millions of unrelated Approval events on these high-traffic tokens.
  const [usdcLogs, usdtLogs] = await Promise.all([
    getLogs({ api, target: USDC, fromBlock: START_BLOCK, eventAbi: APPROVAL_ABI, topics: [APPROVAL_SIG, null, VAULT_TOPIC], onlyArgs: true }),
    getLogs({ api, target: USDT, fromBlock: START_BLOCK, eventAbi: APPROVAL_ABI, topics: [APPROVAL_SIG, null, VAULT_TOPIC], onlyArgs: true }),
  ])

  const owners = [...new Set([
    ...usdcLogs.map(l => l.owner.toLowerCase()),
    ...usdtLogs.map(l => l.owner.toLowerCase()),
  ])]

  // Read live allowance and balance for every discovered LP in one multicall batch
  const [usdcAllowances, usdtAllowances, usdcBalances, usdtBalances] = await Promise.all([
    api.multiCall({ abi: 'function allowance(address,address) view returns (uint256)', calls: owners.map(o => ({ target: USDC, params: [o, VAULT] })) }),
    api.multiCall({ abi: 'function allowance(address,address) view returns (uint256)', calls: owners.map(o => ({ target: USDT, params: [o, VAULT] })) }),
    api.multiCall({ abi: 'function balanceOf(address) view returns (uint256)',         calls: owners.map(o => ({ target: USDC, params: [o] })) }),
    api.multiCall({ abi: 'function balanceOf(address) view returns (uint256)',         calls: owners.map(o => ({ target: USDT, params: [o] })) }),
  ])

  for (let i = 0; i < owners.length; i++) {
    const ua = BigInt(usdcAllowances[i] ?? 0)
    const ta = BigInt(usdtAllowances[i] ?? 0)
    const ub = BigInt(usdcBalances[i]   ?? 0)
    const tb = BigInt(usdtBalances[i]   ?? 0)

    // Skip wallets that haven't approved both tokens — they're on a different pair
    if (ua === 0n || ta === 0n) continue

    api.add(USDC, ua < ub ? ua : ub)  // min(allowance, balance) USDC
    api.add(USDT, ta < tb ? ta : tb)  // min(allowance, balance) USDT
  }
}

module.exports = {
  methodology: 'TVL is the sum of min(allowance, balance) for USDC and USDT across all LP wallets that have approved both tokens to the SuperpositionVault. Granting an approval is equivalent to a deposit; revoking it is equivalent to a withdrawal.',
  ethereum: { tvl },
}
