const sdk = require("@defillama/sdk");
const ADDRESSES = require("./addresses");
const scionVaultAbi = require("./abis/scionVaultAbi");

async function getVaultBalance(timestamp, chainBlocks, chain) {
  const block = chainBlocks[chain];
  const balances = {};

  const vaults = ADDRESSES[chain];

  for (const vault of vaults) {
    const { ADDRESS, UNDERLYING } = vault;

    const totalHoldings = await sdk.api.abi.call({
      abi: scionVaultAbi.totalHoldings,
      chain,
      target: ADDRESS,
      block,
    });

    sdk.util.sumSingleBalance(balances, UNDERLYING, totalHoldings.output);
  }

  return balances;
}

async function moonriver(timestamp, block, chainBlocks) {
  return getVaultBalance(timestamp, chainBlocks, "moonriver");
}

async function fantom(timestamp, block, chainBlocks) {
  return getVaultBalance(timestamp, chainBlocks, "fantom");
}

module.exports = {
      methodology: "Measures the total value deposited in Scion vault contracts",
  moonriver: {
    tvl: moonriver,
  },
  fantom: {
    tvl: fantom,
  },
};
