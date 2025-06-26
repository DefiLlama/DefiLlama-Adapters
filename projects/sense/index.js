const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { nullAddress } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");
const { getLogs } = require("../helper/cache/getLogs");

const DIVIDER = "0x86bA3E96Be68563E41c2f5769F1AF9fAf758e6E0";
const SPACE_FACTORY = "0x9e629751b3FE0b030C219e567156adCB70ad5541";
const BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
const DIVIDER_INIT_BLOCK = 14427177;
const DIVIDER_INIT_TS = 1647831440;

// Converts a bytes32 into an address or, if there is more data, slices an address out of the first 32 byte word
const toAddress = (data) => `0x${data.slice(64 - 40 + 2, 64 + 2)}`;

async function tvl(api) {
  const block = api.block
  const transform = await getChainTransform("ethereum");
  const seriesLogs = await getLogs({
    target: DIVIDER,
    topic: "SeriesInitialized(address,uint256,address,address,address,address)",
    api,
    fromBlock: DIVIDER_INIT_BLOCK,
  });

  const series = seriesLogs.reduce((acc, cur) => {
    const adapter = toAddress(cur.data);
    const maturity = parseInt(cur.topics[1]); // safe to parse uint32 timestamp
    if (acc[adapter]) {
      acc[adapter].push(maturity);
      acc[adapter].sort();
      return acc;
    } else {
      return { ...acc, [adapter]: [maturity] };
    }
  }, {});
  const adapters = Object.keys(series).filter(i => i.toLowerCase() !== '0x0ed600eecf445b71ae3f8170cd368439e2739289');

  const { output: targets } = await sdk.api.abi.multiCall({
    abi: abi.target,
    calls: adapters.map((i) => ({ target: i })),
    block,
  });
  const { output: underlyings } = await sdk.api.abi.multiCall({
    abi: abi.underlying,
    calls: adapters.map((i) => ({ target: i })),
    block,
  });
  const { output: scales } = await sdk.api.abi.multiCall({
    abi: abi.scale,
    calls: adapters.map((i) => ({ target: i })),
    block,
  });

  const { output: targetDecimals } = await sdk.api.abi.multiCall({
    abi: "erc20:decimals",
    calls: targets.map((i) => ({ target: i.output })),
    block,
  });
  const { output: underlyingDecimals } = await sdk.api.abi.multiCall({
    abi: "erc20:decimals",
    calls: underlyings.map((i) => ({ target: i.output })),
    block,
  });

  const balances = {};
  const adapterTargetCache = {};
  const adapterUnderlyingCache = {};
  const adapterScaleCache = {};
  const adapterDecimalDeltaCache = {};

  targets.forEach((i) => (adapterTargetCache[i.input.target] = i.output));
  underlyings.forEach(
    (i) => (adapterUnderlyingCache[i.input.target] = i.output)
  );
  scales.forEach((i) => (adapterScaleCache[i.input.target] = i.output));

  const { output: adapterTargetBalances } = await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: adapters.map((i) => ({ target: adapterTargetCache[i], params: i })),
    block,
  });

  adapterTargetBalances.forEach((i) => {
    const adapterAddress = i.input.params[0];
    const targetAddress = adapterTargetCache[adapterAddress];
    const underlyingAddress = adapterUnderlyingCache[adapterAddress];

    const scale = adapterScaleCache[adapterAddress];

    const targetDec = targetDecimals.find(
      (j) => j.input.target === targetAddress
    ).output;

    const underlyingDec = underlyingDecimals.find(
      (j) => j.input.target === underlyingAddress
    ).output;

    const adapterDecimalDelta = parseInt(targetDec) - parseInt(underlyingDec);
    adapterDecimalDeltaCache[adapterAddress] = adapterDecimalDelta;

    const underlyingBalance = new BigNumber(i.output)
      .times(scale) // always 18 decimals
      .div(`1e${18 + adapterDecimalDelta}`) // convert to underlying decimals (take out 18 from scale multiplication, then add or subtract based tDecimals - uDecimals)
      .toFixed(0);

    sdk.util.sumSingleBalance(
      balances,
      transform(underlyingAddress),
      underlyingBalance
    );
  });

  const poolCalls = Object.entries(series).filter(([i]) => i.toLowerCase() !== '0x0ed600eecf445b71ae3f8170cd368439e2739289')
    .map(([addr, maturities]) => maturities.map((m) => ({ params: [addr, m] })))
    .flat();

  let { output: poolAddresses } = await sdk.api.abi.multiCall({
    target: SPACE_FACTORY,
    abi: abi.pools,
    calls: poolCalls,
    block,
  });
  poolAddresses = poolAddresses.filter((i) => i.output !== nullAddress);

  const poolToAdapterMapping = {};

  poolAddresses.forEach(
    (i) => (poolToAdapterMapping[i.output] = i.input.params[0])
  );

  poolAddresses = poolAddresses.map((i) => i.output);

  let { output: ptis } = await sdk.api.abi.multiCall({
    abi: abi.pti,
    calls: poolAddresses.map((i) => ({ target: i })),
    block,
  });

  let { output: poolIds } = await sdk.api.abi.multiCall({
    abi: abi.getPoolId,
    calls: poolAddresses.map((i) => ({ target: i })),
    block,
  });

  ptis = ptis.map((i) => parseInt(i.output));
  const { output: poolBalances } = await sdk.api.abi.multiCall({
    target: BALANCER_VAULT,
    abi: abi.getPoolTokens,
    calls: poolIds.map((i) => ({ params: i.output })),
    block,
  });

  poolBalances.forEach(({ output: { balances: poolBalance } }, i) => {
    const adapterAddress = poolToAdapterMapping[poolAddresses[i]];
    const underlyingAddress = adapterUnderlyingCache[adapterAddress];
    const adapterDecimalDelta = adapterDecimalDeltaCache[adapterAddress];
    const scale = adapterScaleCache[adapterAddress];

    const underlyingBalance = new BigNumber(poolBalance[1 - ptis[i]])
      .times(scale)
      .div(`1e${18 + adapterDecimalDelta}`) // convert to underlying decimals
      .toFixed(0);

    sdk.util.sumSingleBalance(
      balances,
      transform(underlyingAddress),
      underlyingBalance
    );
  });

  return balances;
}

module.exports = {
    doublecounted: true,
  misrepresentedTokens: true,
  methodology:
    "TVL is comprised of the sum of yield-bearing assets in Sense, which includes those assets being used both 1) to issue fixed term Sense tokens (PTs/YTs) and 2) as reserves in our Space AMM Pools. Data is collected via the DeFi Llama SDK.",
  start: DIVIDER_INIT_TS,
  ethereum: {
    tvl,
  },
};

const abi = {
  target: "address:target",
  underlying: "address:underlying",
  scale: "uint256:scale",
  pools: "function pools(address, uint256) view returns (address)",
  getPoolId: "function getPoolId() view returns (bytes32)",
  pti: "uint256:pti",
  getPoolTokens:
    "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
};
