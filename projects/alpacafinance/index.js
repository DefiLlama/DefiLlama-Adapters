const sdk = require("@defillama/sdk");

const abi = require("./abi.json");

const vaults = [
  {
    token_address: "0xd7D069493685A581d27824Fc46EdA46B7EfC0063",
  },
  {
    token_address: "0x7C9e73d4C71dae564d41F78d56439bB4ba87592f",
  },
  {
    token_address: "0xbfF4a34A4644a113E8200D7F1D79b3555f723AfE",
  },
  {
    token_address: "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
  },
  {
    token_address: "0x158Da805682BdC8ee32d52833aD41E74bb951E59",
  },
];

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const block = chainBlocks["bsc"];
  let balances = {};

  let totalSupplies = (
    await sdk.api.abi.multiCall({
      block,
      calls: vaults.map((token) => ({ target: token.token_address })),
      abi: abi["totalSupply"],
      chain: "bsc",
    })
  ).output;

  let tokens = (
    await sdk.api.abi.multiCall({
      block,
      calls: vaults.map((token) => ({ target: token.token_address })),
      abi: abi["token"],
      chain: "bsc",
    })
  ).output;

  // --- Accounts for lending pools section ---
  for (let i = 0; i < vaults.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      `bsc:${tokens[i].output}`,
      totalSupplies[i].output
    );
  }

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
