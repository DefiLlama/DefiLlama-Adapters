const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens } = require("../helper/unwrapLPs");
const { pool2 } = require("../helper/pool2");
const transformPolygonAddress = (id) => `polygon:${id}`;

const entropyV1Factory = "0xeff87121ab94457789495918eef5a5904eb04419";
const ERP_USDC_quickswap = "0xc4bf2a012af69d44abc4bbe2b1875a222c1c32e1";
const stakingContract = "0x7ace9872ee80145ad7b4d93cf8d84d664c450ea5";
// const vesting = '0x02f1410457ceb105ca8aed71b7654fb05cb61417'
// const sponsorFarm = '0xb956B861BD97bf5195Eb4AA09d5c5EAD1B2e4514'

const poolsTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const block = chainBlocks["polygon"];

  // Get Entropy pool count, andd retrieve their addresses
  const { output: allPoolsLength } = await sdk.api.abi.call({
    target: entropyV1Factory,
    abi: abi["allPoolsLength"],
    chain: "polygon",
    block,
  });
  const poolsCalls = [...Array(parseInt(allPoolsLength)).keys()].map((i) => ({
    target: entropyV1Factory,
    params: i,
  }));
  const { output: allPoolsOutput } = await sdk.api.abi.multiCall({
    calls: poolsCalls,
    abi: abi["allPools"],
    chain: "polygon",
    block,
  });
  console.log(`Number of entropy pools: ${allPoolsLength}`);

  // Get aTokens used as collateral in each pool, and retrieve the amount of aTokens held by each pool
  const allPools = allPoolsOutput.map((o) => o.output);
  const { output: poolsaTokens } = await sdk.api.abi.multiCall({
    calls: allPools.map((o) => ({ target: o })),
    abi: abi["aToken"],
    chain: "polygon",
    block,
  });
  const tokensAndOwners = allPools.map((pool, idx) => [
    poolsaTokens[idx].output,
    pool,
  ]);
  // console.log(tokensAndOwners)
  await sumTokens(
    balances,
    tokensAndOwners,
    block,
    "polygon",
    transformPolygonAddress
  );
  return balances;
};

module.exports = {
  polygon: {
    tvl: poolsTvl,
    pool2: pool2(
      stakingContract,
      ERP_USDC_quickswap,
      "polygon",
      transformPolygonAddress
    ),
  },
  methodology:
    "Entropy Pools store the users collateral as aave aTokens in each pool. Quickswap LP is also staked and accounted for in pool2.",
};
