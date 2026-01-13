const { createPublicClient, http, formatEther } = require("viem");
const { base } = require("viem/chains");

// Created: 2025-12-31
// Updated: 2026-01-04 - Added Yield Adapter for DefiLlama Yields

const VAULT_ADDRESS = "0x5FD0F7eA40984a6a8E9c6f6BDfd297e7dB4448Bd";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

async function tvl(timestamp, block, chainBlocks) {
  const client = createPublicClient({
    chain: base,
    transport: http(),
  });

  const totalAssets = await client.readContract({
    address: VAULT_ADDRESS,
    abi: [
      {
        inputs: [],
        name: "totalAssets",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "totalAssets",
    blockNumber: chainBlocks.base,
  });

  return {
    [`base:${WETH_ADDRESS}`]: totalAssets.toString(),
  };
}

async function apy() {
  // This function is used by DefiLlama Yields to track APY over time
  // It pulls from our public stats API which reflects the bot's actual performance
  try {
    const response = await fetch("https://kerne.finance/api/stats");
    const data = await response.json();
    
    return [
      {
        pool: `${VAULT_ADDRESS}-base`,
        chain: "Base",
        project: "kerne-protocol",
        symbol: "kLP",
        tvlUsd: parseFloat(data.tvl_usd) || 0,
        apyBase: parseFloat(data.current_apy) || 0,
        underlyingTokens: [WETH_ADDRESS],
        rewardTokens: [], // Kerne yield is auto-compounding in kLP price
        url: "https://kerne.finance/terminal"
      }
    ];
  } catch (e) {
    console.error("Failed to fetch APY stats:", e);
    return [];
  }
}

module.exports = {
  methodology: "TVL is calculated by calling totalAssets() on the KerneVault ERC-4626 contract. This includes on-chain WETH collateral and off-chain hedging reserves attested on-chain via the KerneVerificationNode.",
  timetravel: true,
  misrepresentedTokens: false,
  base: {
    tvl,
  },
  yields: {
    apy
  }
};
