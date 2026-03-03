const { createPublicClient, http } = require("viem");
const { base } = require("viem/chains");

// Kerne Protocol TVL Adapter for DefiLlama
// VAULT_ADDRESS: 0x5FD0F7eA40984a6a8E9c6f6BDfd297e7dB4448Bd
// ASSET: WETH (0x4200000000000000000000000000000000000006)

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

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  base: {
    tvl,
  },
  methodology: "TVL is calculated by calling totalAssets() on the KerneVault contract, which includes both on-chain LST collateral and off-chain CEX hedging positions reported by the protocol strategist.",
};
