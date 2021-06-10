const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");
const erc20 = require("../helper/abis/erc20.json");

const factory = "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("bsc", chainBlocks, factory, balances);

  // --- Accounting for BANANA token staked in MasterApe ---
  const bananaBalance = (
    await sdk.api.abi.call({
      block: chainBlocks["bsc"],
      chain: "bsc",
      target: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
      params: "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
      abi: erc20["balanceOf"],
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    "bsc:0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
    bananaBalance
  );

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
