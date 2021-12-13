const sdk = require("@defillama/sdk");

const stakingContract = "0x5B0d74C78F2588B3C5C49857EdB856cC731dc557";
const colonyGovernanceToken = "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6";

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  const valueLocked = (
    await sdk.api.erc20.balanceOf({
      block: chainBlocks.avax,
      target: colonyGovernanceToken,
      owner: stakingContract,
      chain: "avax",
    })
  ).output;
  sdk.util.sumSingleBalance(
    balances,
    `avax:${colonyGovernanceToken}`,
    valueLocked
  );
  return balances;
}

module.exports = {
  methodology:
    "Staking is calculated based on CLY tokens locked on Colony staking contract",
  avalanche: {
    tvl: async () => ({}),
    staking,
  },
  tvl: async () => ({}),
};
