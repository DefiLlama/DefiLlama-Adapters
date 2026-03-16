/**
 * Local test script for Chapool EARN TVL adapter.
 *
 * Tests against opBNB Testnet (chainId 5611) since the mainnet EARN contracts
 * are not yet deployed. This script is NOT submitted to DefiLlama.
 *
 * Usage:
 *   cd DefiLlama-Adapters
 *   node projects/chapool-earn/test-testnet.js
 */

const { ethers } = require("ethers");

// ─── opBNB Testnet addresses (from deployments/opbnbTestnet/earn.json) ────────
const TESTNET = {
  rpc:          "https://opbnb-testnet-rpc.bnbchain.org",
  VAULT_READER: "0x5895A836679AaFeD205cD6689627aC8160860b82",
  EARN_VAULT:   "0xe57E96e423306847990877b8334BDB711efdfD10",
  VECPOT_LOCKER:"0xfF226A6D5A8F3Ff5E621cD9C1564310beC65509f",
  MOCK_USDT:    "0x1950cDE2DECb98Ee93a1D636fA923Fe8a3f09094",
  MOCK_CPOT:    "0xDECC4966A5fe63fF0c8f8545AEAB025390195b5d",
};

const ABI = [
  "function getTVL() view returns (uint256)",
  "function getProtocolOverview() view returns (uint256 tvl, uint256 totalWeightedUSDT, uint256 totalUsers, uint256 rewardRate, uint256 dailyCPPEmission, bool emergencyMode)",
  "function totalVaultAssets() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const provider = new ethers.JsonRpcProvider(TESTNET.rpc);
  const reader   = new ethers.Contract(TESTNET.VAULT_READER,  ABI, provider);
  const vault    = new ethers.Contract(TESTNET.EARN_VAULT,    ABI, provider);
  const cpot     = new ethers.Contract(TESTNET.MOCK_CPOT,     ABI, provider);

  console.log("=== Chapool EARN — opBNB Testnet TVL Check ===\n");

  // 1. Via VaultReader.getTVL()
  const tvl = await reader.getTVL();
  console.log("VaultReader.getTVL()      :", ethers.formatUnits(tvl, 18), "USDT");

  // 2. Via EarnVault.totalVaultAssets() (fallback path)
  const vaultAssets = await vault.totalVaultAssets();
  console.log("EarnVault.totalVaultAssets:", ethers.formatUnits(vaultAssets, 18), "USDT");

  // 3. CPOT locked in VeCPOTLocker
  const cpotLocked = await cpot.balanceOf(TESTNET.VECPOT_LOCKER);
  console.log("CPOT in VeCPOTLocker      :", ethers.formatUnits(cpotLocked, 18), "CPOT");

  // 4. Protocol overview (informational)
  const overview = await reader.getProtocolOverview();
  console.log("\n=== Protocol Overview ===");
  console.log("TVL (USDT)         :", ethers.formatUnits(overview.tvl, 18));
  console.log("Total Weighted USDT:", ethers.formatUnits(overview.totalWeightedUSDT, 18));
  console.log("Total Users        :", overview.totalUsers.toString());
  console.log("Reward Rate (CPP/s):", ethers.formatUnits(overview.rewardRate, 18));
  console.log("Daily CPP Emission :", ethers.formatUnits(overview.dailyCPPEmission, 18));
  console.log("Emergency Mode     :", overview.emergencyMode);
}

main().catch(console.error);
