const sdk = require("@defillama/sdk");
async function getTotalCollateral(pools, chain, block) {
  const balances = {};
  await Promise.all(
    pools.map((pool) =>
      sdk.api.erc20
        .balanceOf({
          target: pool[1],
          owner: pool[0],
          chain,
          block,
        })
        .then((result) => {
            sdk.util.sumSingleBalance(balances, pool[2], result.output)
        }

        )
    )
  );
  return balances;
}

const avaxLpPools = [
    [
      "0x332f909F6bBa8c1B124202F9FEC5d515c7635500",
      "0xD0755413bfE2e08dB6bE72761cdD56d77d4B60f1",
      "avax:0xD0755413bfE2e08dB6bE72761cdD56d77d4B60f1",
    ], // north
];



const avaxStakingPool = [
  [
    "0xe40EddA6d49d935D03eC8F7FAFd84DE14d99D2a1",
    "0xD0755413bfE2e08dB6bE72761cdD56d77d4B60f1",
    "avax:0xD0755413bfE2e08dB6bE72761cdD56d77d4B60f1",
  ], // sNORTH
];


async function lp(timestamp, block, chainBlocks) {
  return await getTotalCollateral(avaxLpPools, "avax", chainBlocks["avax"]);
}

async function northStaking(timestamp, block, chainBlocks) {
  return await getTotalCollateral(avaxStakingPool, "avax", chainBlocks["avax"]);
}

function mergeBalances(balances, balancesToMerge) {
  Object.entries(balancesToMerge).forEach((balance) => {
    sdk.util.sumSingleBalance(balances, balance[0], balance[1]);
  });
}
async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  await Promise.all([lp(timestamp, block, chainBlocks)]).then((poolBalances) =>
    poolBalances.forEach((pool) => mergeBalances(balances, pool))
  );
  return balances;
}

module.exports = {

  avax: {
    tvl: lp,
    northStaking,
  },
  tvl,
};