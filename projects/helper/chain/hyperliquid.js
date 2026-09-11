const { post } = require("../http");

const API_URL = 'https://api.hyperliquid.xyz/info';

async function getUserStakingSummary(user) {
  const data = await post(API_URL, { type: 'delegatorSummary', user })
  const { delegated, undelegated, totalPendingWithdrawal } = data
  if (delegated === undefined || undelegated === undefined || totalPendingWithdrawal === undefined)
    throw new Error(`Unexpected delegatorSummary response for ${user}: ${JSON.stringify(data)}`)
  return { delegated: +delegated, undelegated: +undelegated, totalPendingWithdrawal: +totalPendingWithdrawal }
}

async function getHypercoreStakedHype(user) {
  const { delegated, undelegated, totalPendingWithdrawal } = await getUserStakingSummary(user)
  return BigInt(Math.round((delegated + undelegated + totalPendingWithdrawal) * 1e18))
}

/**
 * Add a user's HyperCore spot balances to the api.
 *
 * Spot balances live on HyperCore, not the EVM, so no on-chain lookup sees them.
 * spotMeta gives each spot token its EVM twin (`evmContract`) when one exists -
 * that is the address the pricing side knows. HYPE itself has no evmContract
 * (it is the gas token), so it is added as such. Tokens with neither are skipped:
 * they are unpriceable dust here.
 */
async function addHypercoreSpotBalances({ api, owners = [], blacklistedTokens = [] }) {
  const { tokens: meta } = await post(API_URL, { type: 'spotMeta' })
  const tokenById = {}
  meta.forEach(token => tokenById[token.index] = token)
  const blacklist = new Set(blacklistedTokens.map(i => i.toLowerCase()))

  for (const user of owners) {
    const { balances } = await post(API_URL, { type: 'spotClearinghouseState', user })
    for (const { coin, token, total } of balances) {
      const amount = +total
      if (!amount) continue
      const info = tokenById[token]
      if (!info) continue
      if (coin === 'HYPE') {
        api.addGasToken(BigInt(Math.round(amount * 1e18)))
        continue
      }
      if (coin === 'USDC') {
        // spotMeta points USDC at its bridge contract, which is not the address
        // the pricing side knows - count it as plain dollars instead
        api.addUSDValue(amount)
        continue
      }
      const address = info.evmContract?.address
      if (!address || blacklist.has(address.toLowerCase())) continue
      // the EVM twin's decimals are the core token's weiDecimals shifted by the
      // per-token extra the bridge applies
      const decimals = info.weiDecimals + (info.evmContract.evm_extra_wei_decimals ?? 0)
      api.add(address, BigInt(Math.round(amount * 10 ** decimals)))
    }
  }
}

module.exports = { getUserStakingSummary, getHypercoreStakedHype, addHypercoreSpotBalances }
