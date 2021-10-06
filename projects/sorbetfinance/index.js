const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const G_UNI_Factory = "0xEA1aFf9dbFfD1580F6b81A3ad3589E66652dB7D9";

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const getAllDeplores = (
    await sdk.api.abi.call({
      abi: abi.getDeployers,
      target: G_UNI_Factory,
      ethBlock,
    })
  ).output;

  const getAllPools = (
    await sdk.api.abi.multiCall({
      abi: abi.getPools,
      calls: getAllDeplores.map((deployer) => ({
        target: G_UNI_Factory,
        params: deployer,
      })),
      ethBlock,
    })
  ).output.map((pool) => pool.output);

  const allGelatoPools = [].concat.apply([], getAllPools);

  const token0 = (
    await sdk.api.abi.multiCall({
      abi: abi.token0,
      calls: allGelatoPools.map((pool) => ({
        target: pool,
      })),
      ethBlock,
    })
  ).output.map((t0) => t0.output);

  const token1 = (
    await sdk.api.abi.multiCall({
      abi: abi.token1,
      calls: allGelatoPools.map((pool) => ({
        target: pool,
      })),
      ethBlock,
    })
  ).output.map((t1) => t1.output);

  const balanceOfPools = (
    await sdk.api.abi.multiCall({
      abi: abi.getUnderlyingBalances,
      calls: allGelatoPools.map((pool) => ({
        target: pool,
      })),
      ethBlock,
    })
  ).output.map((bal) => bal.output);

  for (let i = 0; i < allGelatoPools.length; i++) {
    sdk.util.sumSingleBalance(balances, token0[i], balanceOfPools[i].amount0Current);
    sdk.util.sumSingleBalance(balances, token1[i], balanceOfPools[i].amount1Current);
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "Counts TVL that's on all the Pools through G-UNI Factory Contract",
};
