const { call, parseAddress } = require('../helper/chain/starknet')
const ADDRESSES = require('../helper/coreAssets.json')

const STAKING_CONTRACT = '0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7'

const abis = {
  get_active_tokens: {
    name: "get_active_tokens",
    type: "function",
    inputs: [],
    outputs: [{ type: "core::array::Span::<core::starknet::contract_address::ContractAddress>" }],
    state_mutability: "view"
  },
}

const balanceAbi = (name) => ({
  name, type: "function", state_mutability: "view",
  inputs: [{ name: "account", type: "felt" }],
  outputs: [{ name: "balance", type: "Uint256" }],
})

// Active set mixes ERC20 implementations using camelCase (`balanceOf`) and
// snake_case (`balance_of`); fall back per token rather than failing the call.
// Only swallow ABI-mismatch errors (different RPCs surface this either as the
// canonical "entrypoint not found" or as JSON-RPC "Invalid params") so that
// transient transport failures still propagate instead of silently zeroing
// the token's contribution to TVL.
const ABI_MISMATCH_ERROR = /entrypoint|entry point|selector|invalid params/i

async function balanceOf(token, owner) {
  let lastErr
  for (const name of ["balanceOf", "balance_of"]) {
    try {
      return await call({ target: token, abi: balanceAbi(name), params: [owner] })
    } catch (e) {
      if (!ABI_MISMATCH_ERROR.test(String(e?.message ?? e))) throw e
      lastErr = e
    }
  }
  throw new Error(`No compatible balance entrypoint found for token ${token}: ${lastErr?.message ?? lastErr}`)
}

async function tvl(api) {
  const tokens = (await call({ target: STAKING_CONTRACT, abi: abis.get_active_tokens }))
    .map(parseAddress)
    .filter(t => t !== ADDRESSES.starknet.STRK)
  const balances = await Promise.all(tokens.map(t => balanceOf(t, STAKING_CONTRACT)))
  tokens.forEach((t, i) => api.add(t, balances[i]))
}

module.exports = {
  methodology: 'TVL is the sum of all BTC tokens staked in the Starknet BTC staking contract.',
  timetravel: false,
  starknet: { tvl },
}
