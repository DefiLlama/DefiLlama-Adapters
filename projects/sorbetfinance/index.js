const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const chainTvl = (chain, G_UNI_Factory) => async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const block = chainBlocks[chain]

  const getAllDeplores = (
    await sdk.api.abi.call({
      abi: abi.getDeployers,
      target: G_UNI_Factory,
      block,
      chain,
    })
  ).output;

  const getAllPools = (
    await sdk.api.abi.multiCall({
      abi: abi.getPools,
      calls: getAllDeplores.map((deployer) => ({
        target: G_UNI_Factory,
        params: deployer,
      })),
      block,
      chain,
    })
  ).output.map((pool) => pool.output);

  const allGelatoPools = [].concat.apply([], getAllPools);

  const token0 = (
    await sdk.api.abi.multiCall({
      abi: abi.token0,
      calls: allGelatoPools.map((pool) => ({
        target: pool,
      })),
      block,
      chain
    })
  ).output.map((t0) => t0.output);

  const token1 = (
    await sdk.api.abi.multiCall({
      abi: abi.token1,
      calls: allGelatoPools.map((pool) => ({
        target: pool,
      })),
      block,
      chain,
    })
  ).output.map((t1) => t1.output);

  const balanceOfPools = (
    await sdk.api.abi.multiCall({
      abi: abi.getUnderlyingBalances,
      calls: allGelatoPools.map((pool) => ({
        target: pool,
      })),
      block,
      chain
    })
  ).output.map((bal) => bal.output);

  for (let i = 0; i < allGelatoPools.length; i++) {
    sdk.util.sumSingleBalance(balances, `${chain}:${token0[i]}`, balanceOfPools[i].amount0Current);
    sdk.util.sumSingleBalance(balances, `${chain}:${token1[i]}`, balanceOfPools[i].amount1Current);
  }

  return balances;
};

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: chainTvl("ethereum", "0xEA1aFf9dbFfD1580F6b81A3ad3589E66652dB7D9"),
  },
  optimism: {
    tvl: chainTvl("optimism", "0x2845c6929d621e32B7596520C8a1E5a37e616F09"),
  },
  polygon: {
    tvl: chainTvl("polygon", "0x37265A834e95D11c36527451c7844eF346dC342a")
  },
  methodology:
    "Counts TVL that's on all the Pools through G-UNI Factory Contract",
  hallmarks:[
      [1632253540, "GUNI-DAIUSDC Added to Maker"],
      [1643056020, "Maker GUNI Cap to 500M"],
  ],
};
