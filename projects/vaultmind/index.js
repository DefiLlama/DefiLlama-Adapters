/**
 * @module vaultmind
 * @description DefiLlama TVL adapter for VaultMind (AgentVault) on BOT Chain.
 * VaultMind is a policy-guarded vault for autonomous AI agents: an on-chain
 * vault with hard spending limits (max 0.01 BOT per payment, max 0.025 BOT
 * per day), recipient allowlists and a freeze switch.
 */

// VaultMind vault contract on BOT Chain (chain id 677), deployed at block 29438681
const VAULT = '0x666dc10b61e05aab26673463170b7f5ac920825d'

/**
 * Calculates TVL as the native BOT held by the VaultMind vault contract.
 * The vault only ever holds native BOT, so its ether balance is the full TVL.
 * @param {object} api - DefiLlama SDK ChainApi instance
 * @returns {Promise<object>} Token balances object
 */
async function tvl(api) {
  api.addGasToken(await api.getEthBalance(VAULT))
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL is the native BOT held by the VaultMind vault contract (0x666dc10b61e05aab26673463170b7f5ac920825d) on BOT Chain. The vault is a policy-guarded vault for AI agents and only holds native BOT, so the contract ether balance is counted in full.',
  start: 1794063450, // 2026-11-07, vault deployment (block 29438681)
  bot: {
    tvl,
  },
}
