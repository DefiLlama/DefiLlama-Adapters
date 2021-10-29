const sdk = require("@defillama/sdk");
const getPools = require("./getPools.json");

const DCBToken = "0xEAc9873291dDAcA754EA5642114151f3035c67A2";
const Staking = "0x22B551fE288c93A3Ac9172aD998A1D9ce1A882e5";

async function staking(timestamp, block, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: DCBToken,
    owner: Staking,
    block: chainBlocks.bsc,
    chain: "bsc",
  });

  sdk.util.sumSingleBalance(balances, `bsc:${DCBToken}`, balance);

  return balances;
}

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};

  const pools = await sdk.api.abi.call({
    target: Staking,
    abi: getPools,
    block: chainBlocks.bsc,
    chain: "bsc",
  });

  pools.output.forEach(({ totalDeposit }) =>
    sdk.util.sumSingleBalance(balances, `bsc:${DCBToken}`, totalDeposit)
  );

  return balances;
}

module.exports = {
  bsc: {
    tvl,
    staking,
  },
  tvl,
};
