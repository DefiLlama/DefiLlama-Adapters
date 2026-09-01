const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { nullAddress } = require("../helper/unwrapLPs");
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

  const targets = await api.multiCall({ abi: abi.target, calls: adapters, });
  const underlyings = await api.multiCall({ abi: abi.underlying, calls: adapters, });
  const scales = await api.multiCall({ abi: abi.scale, calls: adapters, });

  const targetDecimals = await api.multiCall({ abi: "erc20:decimals", calls: targets, });
  const underlyingDecimals = await api.multiCall({ abi: "erc20:decimals", calls: underlyings, });

  const adapterTargetCache = {};
  const adapterUnderlyingCache = {};
  const adapterScaleCache = {};
  const adapterDecimalDeltaCache = {};

  targets.forEach((i, idx) => (adapterTargetCache[adapters[idx]] = i));
  underlyings.forEach((i, idx) => (adapterUnderlyingCache[adapters[idx]] = i));
  scales.forEach((i, idx) => (adapterScaleCache[adapters[idx]] = i));

  const adapterTargetBalances = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: adapters.map((i, idx) => ({ target: targets[idx], params: i })),
  });

  adapterTargetBalances.forEach((i, idx) => {
    const adapterAddress = adapters[idx]
    const targetAddress = adapterTargetCache[adapterAddress];
    const underlyingAddress = adapterUnderlyingCache[adapterAddress];

    const scale = adapterScaleCache[adapterAddress];

    const targetDec = targetDecimals.find((j, idx) => targets[idx] === targetAddress)
    const underlyingDec = underlyingDecimals.find((j, idx) => underlyings[idx] === underlyingAddress)
    const adapterDecimalDelta = parseInt(targetDec) - parseInt(underlyingDec);
    adapterDecimalDeltaCache[adapterAddress] = adapterDecimalDelta;

    const underlyingBalance = new BigNumber(i)
      .times(scale) // always 18 decimals
      .div(`1e${18 + adapterDecimalDelta}`) // convert to underlying decimals (take out 18 from scale multiplication, then add or subtract based tDecimals - uDecimals)
      .toFixed(0);

    api.add(underlyingAddress, underlyingBalance);
  });

  const poolCalls = Object.entries(series).filter(([i]) => i.toLowerCase() !== '0x0ed600eecf445b71ae3f8170cd368439e2739289')
    .map(([addr, maturities]) => maturities.map((m) => ({ params: [addr, m] })))
    .flat();

  let poolAddresses = await api.multiCall({ target: SPACE_FACTORY, abi: abi.pools, calls: poolCalls, });
  poolAddresses = poolAddresses.filter((i) => i !== nullAddress);

  const poolToAdapterMapping = {};

  poolAddresses.forEach((i, idx) => (poolToAdapterMapping[i] = poolCalls[idx]));

  let ptis = await api.multiCall({ abi: abi.pti, calls: poolAddresses, });
  let poolIds = await api.multiCall({ abi: abi.getPoolId, calls: poolAddresses, });

  ptis = ptis.map((i) => parseInt(i));
  const poolBalances = await api.multiCall({ target: BALANCER_VAULT, abi: abi.getPoolTokens, calls: poolIds, });

  poolBalances.forEach(({ balances: poolBalance }, i) => {
    const adapterAddress = poolToAdapterMapping[poolAddresses[i]].params[0]
    const underlyingAddress = adapterUnderlyingCache[adapterAddress];
    const adapterDecimalDelta = adapterDecimalDeltaCache[adapterAddress];
    const scale = adapterScaleCache[adapterAddress];

    const underlyingBalance = new BigNumber(poolBalance[1 - ptis[i]])
      .times(scale)
      .div(`1e${18 + adapterDecimalDelta}`) // convert to underlying decimals
      .toFixed(0);

    api.add(underlyingAddress, underlyingBalance);
  });

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
