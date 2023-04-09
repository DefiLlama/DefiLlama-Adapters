const abi = require("./abi.json");
const { getUniTVL } = require("../helper/unknownTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakings } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { default: BigNumber } = require("bignumber.js");
const chef = "0xfBb572B2F67746fe3A0Cb7DbDeE6717581a790cc";
const mono = "0xbC0a588120AB8b913436D342a702C92611C9af6a";
const ACC_MONO_PRECISION = 1e18;

const bentoLps = [
  {
    pid: 4,
    lp: "0x79bf7147eBCd0d55e83Cb42ed3Ba1bB2Bb23eF20",
    lpDecimals: 18,
    token0Decimals: 6,
    token1Decimals: 6,
  },
  {
    pid: 5,
    lp: "0x6DBE389142E40b01aA10Fb069ae448Fc4460DaE4",
    lpDecimals: 18,
    token0Decimals: 18,
    token1Decimals: 6,
  },
];

async function getTokensInMasterChef(time, ethBlock, chainBlocks) {
  const chain = "arbitrum";
  const block = chainBlocks[chain];
  const transformAddress = (addr) => `arbitrum:${addr}`;
  const ignoreAddresses = [mono].map((i) => i.toLowerCase());

  const balances = {};
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: chef,
      block,
      chain,
    })
  ).output;

  const poolInfo = (
    await sdk.api.abi.multiCall({
      block,
      calls: Array.from(Array(Number(poolLength)).keys()).map((i) => ({
        target: chef,
        params: i,
      })),
      abi: abi.poolInfo,
      chain,
    })
  ).output;

  const bentoLpTotalSupply = (
    await sdk.api.abi.multiCall({
      block,
      calls: bentoLps.map((lp) => ({
        target: lp.lp,
      })),
      abi: abi.totalSupply,
      chain,
    })
  ).output;

  const bentoLpReserves = (
    await sdk.api.abi.multiCall({
      block,
      calls: bentoLps.map((lp) => ({
        target: lp.lp,
      })),
      abi: abi.getReserves,
      chain,
    })
  ).output;
  const bentoLpAssets = (
    await sdk.api.abi.multiCall({
      block,
      calls: bentoLps.map((lp) => ({
        target: lp.lp,
      })),
      abi: abi.getAssets,
      chain,
    })
  ).output;

  const bentoLpData = bentoLps.map((lp, i) => {
    return {
      ...lp,
      lpPerToken0:
        bentoLpReserves[i].output._reserve0 /
        10 ** lp.token0Decimals /
        (bentoLpTotalSupply[i].output / 1e18),
      lpPerToken1:
        bentoLpReserves[i].output._reserve1 /
        10 ** lp.token1Decimals /
        (bentoLpTotalSupply[i].output / 1e18),
      token0: bentoLpAssets[i].output[0],
      token1: bentoLpAssets[i].output[1],
    };
  });

  poolInfo.forEach(({ output: pool }, pid) => {
    if (pid === 4 || pid === 5) {
      const lpData = bentoLpData.find((lp) => lp.pid === pid);

      const token0 = lpData.token0.toLowerCase();
      const token1 = lpData.token1.toLowerCase();

      const balance = BigNumber(pool.totalShares)
        .times(pool.lpPerShare)
        .div(ACC_MONO_PRECISION)
        .toFixed(0);

      const token0Balance = BigNumber(balance)
        .multipliedBy(lpData.lpPerToken0)
        .div(Number(10 ** (18 - lpData.token0Decimals)))
        .toFixed(0);
      const token1Balance = BigNumber(balance)
        .multipliedBy(lpData.lpPerToken1)
        .div(Number(10 ** (18 - lpData.token1Decimals)))
        .toFixed(0);
      sdk.util.sumSingleBalance(
        balances,
        transformAddress(token0),
        token0Balance
      );
      sdk.util.sumSingleBalance(
        balances,
        transformAddress(token1),
        token1Balance
      );
    } else {
      const token = pool[0].toLowerCase();
      const balance = BigNumber(pool.totalShares)
        .times(pool.lpPerShare)
        .div(ACC_MONO_PRECISION)
        .toFixed(0);
      sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
    }
  });

  return balances;
}
module.exports = {
  arbitrum: {
    methodology:
      "TVL includes all farms in MasterChef contract, as well as staking pools.",
    tvl: getTokensInMasterChef,
  },
};
