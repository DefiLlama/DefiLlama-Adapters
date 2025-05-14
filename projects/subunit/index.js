const sdk = require("@defillama/sdk");

const subVaultAddress = "0x1b745230a0320470a9af55BB0a67c47C90978A14";
const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const chain = "base";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  // If chainBlocks is not provided, default to an empty object
  chainBlocks = chainBlocks || {};

  const subVaultBalance = await sdk.api.erc20.balanceOf({
    target: usdcAddress,
    owner: subVaultAddress,
    chain: chain,
    block: chainBlocks[chain], // Use block from chainBlocks if available
  });

  sdk.util.sumSingleBalance(balances, `${chain}:${usdcAddress}`, subVaultBalance.output);

  return balances;
}

module.exports = {
  methodology: "Calculates the TVL by summing the USDC balance held in the SubVault contract on Base.",
  base: {
    tvl,
  },
};
