const sdk = require("@defillama/sdk");

const stakingV1Contract = "0x5B0d74C78F2588B3C5C49857EdB856cC731dc557";
const stakingV2Contract = "0x7CcDa6E26dCeD1Ba275c67CD20235790ed615A8D";
const colonyGovernanceToken = "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6";

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  const stakingV1 = (
    await sdk.api.erc20.balanceOf({
      block: chainBlocks.avax,
      target: colonyGovernanceToken,
      owner: stakingV1Contract,
      chain: "avax",
    })
  ).output;

  const stakingV2 = (
    await sdk.api.erc20.balanceOf({
      block: chainBlocks.avax,
      target: colonyGovernanceToken,
      owner: stakingV2Contract,
      chain: "avax",
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    `avax:${colonyGovernanceToken}`,
    stakingV1
  );

  sdk.util.sumSingleBalance(
    balances,
    `avax:${colonyGovernanceToken}`,
    stakingV2
  );

  return balances;
}

module.exports = {
  methodology:
    "Staking is calculated based on CLY tokens locked on Colony staking contracts",
  avax:{
    tvl: async () => ({}),
    staking,
  },
};
