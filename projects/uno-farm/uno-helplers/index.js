const sdk = require("@defillama/sdk");

const abi = require("./abis/UnoFactory.json");
const UnoFarmBalancerABI = require("./abis/UnoFarmBalancer.json");
const UnoFarmQuickswapABI = require("./abis/UnoFarmQuickswap.json");

async function getUnoFarms({
  factory,
  chain,
  block,
  getFarms = null,
  getLPAddress = null,
}) {
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: factory,
      block,
      chain,
    })
  ).output;
  const dummyArray = Array.from(Array(Number(poolLength)).keys());
  const lpCalls = dummyArray.map((i) => ({ target: factory, params: i }));
  const lpTokens = (
    await sdk.api.abi.multiCall({
      block,
      calls: lpCalls,
      abi: abi.pools,
      chain,
    })
  ).output.map((a) => (getLPAddress ? getLPAddress(a.output) : a.output));
  const farmsCalls = lpTokens.map((i) => ({ target: factory, params: i }));
  const farms = (
    await sdk.api.abi.multiCall({
      block,
      calls: farmsCalls,
      abi: abi.Farms,
      chain,
    })
  ).output.map((a) => (getFarms ? getFarms(a.output) : a.output));
  return farms;
}

async function getUnoFarmsAndTheirLpTokens({
  factory,
  chain,
  block,
  getFarms = null,
  getLPAddress = null,
}) {
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: factory,
      block,
      chain,
    })
  ).output;
  const dummyArray = Array.from(Array(Number(poolLength)).keys());
  const lpCalls = dummyArray.map((i) => ({ target: factory, params: i }));
  const lpTokens = (
    await sdk.api.abi.multiCall({
      block,
      calls: lpCalls,
      abi: abi.pools,
      chain,
    })
  ).output.map((a) => (getLPAddress ? getLPAddress(a.output) : a.output));
  const farmsCalls = lpTokens.map((i) => ({ target: factory, params: i }));
  const farms = (
    await sdk.api.abi.multiCall({
      block,
      calls: farmsCalls,
      abi: abi.Farms,
      chain,
    })
  ).output.map((a) => (getFarms ? getFarms(a.output) : a.output));
  return farms.map((v, i) => ({
    farm: v,
    lpToken: lpTokens[i],
  }));
}

async function getFullInfoBalancerUnoFarm({
  factory,
  chain,
  block,
  getFarms = null,
  getLPAddress = null,
}) {
  const dataFarms = await getUnoFarmsAndTheirLpTokens({
    factory,
    chain,
    block,
    getFarms,
    getLPAddress,
  });
  const gaugeCalls = dataFarms.map((v) => ({ target: v.farm }));
  const streamerCalls = dataFarms.map((v) => ({ target: v.farm }));
  const gauges = (
    await sdk.api.abi.multiCall({
      block,
      calls: gaugeCalls,
      abi: UnoFarmBalancerABI.gauge,
      chain,
    })
  ).output.map((a) => a.output);
  const streamers = (
    await sdk.api.abi.multiCall({
      block,
      calls: streamerCalls,
      abi: UnoFarmBalancerABI.streamer,
      chain,
      permitFailure: true,
    })
  ).output.map((a) => a.output);

  return dataFarms.map((v, i) => ({
    ...v,
    gauge: gauges[i],
    streamer: streamers[i],
  }));
}
async function getFullInfoQuickswapUnoFarm({
    factory,
    chain,
    block,
    getFarms = null,
    getLPAddress = null,
  }) {
    const dataFarms = await getUnoFarmsAndTheirLpTokens({
      factory,
      chain,
      block,
      getFarms,
      getLPAddress,
    });
    const stakeTokenCalls = dataFarms.map((v) => ({ target: v.farm }));
    const stakeTokens = (
      await sdk.api.abi.multiCall({
        block,
        calls: stakeTokenCalls,
        abi: UnoFarmQuickswapABI.lpPair,
        chain,
        permitFailure: true,
      })
    ).output.map((a) => a.output);

  
    return dataFarms.map((v, i) => ({
      ...v,
      stakeToken: stakeTokens[i],
    })).filter(v=>v.stakeToken !== null);
  }
  
module.exports = {
  getUnoFarms,
  getUnoFarmsAndTheirLpTokens,
  getFullInfoBalancerUnoFarm,
  getFullInfoQuickswapUnoFarm,
};
