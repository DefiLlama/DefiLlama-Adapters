/**
 * @module vaultmind
 * @description DefiLlama TVL adapter for VaultMind (AgentVault) on BOT Chain.
 * VaultMind is a policy-guarded vault for autonomous AI agents: an on-chain
 * vault with hard spending limits (max 0.01 BOT per payment, max 0.025 BOT
 * per day), recipient allowlists and a freeze switch.
 */

// VaultMind vault contract on BOT Chain (chain id 677), deployed at block 29438681
const VAULT = '0x666dc10b61e05aab26673463170b7f5ac920825d'

// Wrapped BOT (WBOT) on BOT Chain — WETH9-style wrapper of native BOT.
// The vault holds native BOT, which has no DefiLlama price under the gas-token
// key, so the balance is booked under WBOT (1:1 with BOT) to get a USD price.
const WBOT = '0xD5452816194a3784dBa983426cCe7c122F4abd30'

/**
 * Calculates TVL as the native BOT held by the VaultMind vault contract.
 * The vault only ever holds native BOT, so its ether balance is the full TVL.
 * @param {object} api - DefiLlama SDK ChainApi instance
 * @returns {Promise<object>} Token balances object
 */
async function tvl(api) {
  api.add(WBOT, await api.getEthBalance(VAULT))
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL is the native BOT held by the VaultMind vault contract (0x666dc10b61e05aab26673463170b7f5ac920825d) on BOT Chain. The vault only ever holds native BOT, so the contract ether balance is counted in full, booked under Wrapped BOT (WBOT, 0xD5452816194a3784dBa983426cCe7c122F4abd30), the 1:1 WETH9-style wrapper of native BOT, so the balance gets a USD price.',
  start: 1794063450, // 2026-11-07, vault deployment (block 29438681)
  bot: {
    tvl,
  },
}
