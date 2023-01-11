const sdk = require("@defillama/sdk");
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getChainTransform } = require('../helper/portedTokens')
const { getLogs } = require('../helper/cache/getLogs')

const DIVIDER = "0x86bA3E96Be68563E41c2f5769F1AF9fAf758e6E0";
const SPACE_FACTORY = "0x5f6e8e9C888760856e22057CBc81dD9e0494aA34";
const BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
const DIVIDER_INIT_BLOCK = 14427177;
const DIVIDER_INIT_TS = 1647831440;

// Converts a bytes32 into an address or, if there is more data, slices an address out of the first 32 byte word
const toAddress = (data) => `0x${data.slice(64 - 40 + 2, 64 + 2)}`;

async function tvl(_time, block, _1, { api }) {
  const transform = await getChainTransform('ethereum')
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
  const adapters = Object.keys(series)

  const { output: targets } = await sdk.api.abi.multiCall({
    abi: abi.target,
    calls: adapters.map(i => ({ target: i })),
    block,
  })
  const toa = targets.map(i => ([i.output, i.input.target]))
  const adapterTargetCache = {}
  targets.forEach(i => adapterTargetCache[i.input.target] = i.output)
  const balances = await sumTokens2({ block, tokensAndOwners: toa})
  const poolCalls = Object.entries(series).map(([addr, maturities]) => maturities.map(m => ({ params: [addr, m]})) ).flat()
  let { output: poolAddresses } = await sdk.api.abi.multiCall({
    target: SPACE_FACTORY,
    abi: abi.pools,
    calls: poolCalls,
    block,
  })
  poolAddresses = poolAddresses.filter(i => i.output !== nullAddress)
  const poolToTargetMapping = {}
  poolAddresses.forEach(i => poolToTargetMapping[i.output] = adapterTargetCache[i.input.params[0]])
  poolAddresses = poolAddresses.map(i => i.output)
  let { output: ptis } = await sdk.api.abi.multiCall({
    abi: abi.pti,
    calls: poolAddresses.map(i => ({ target: i})),
    block,
  })
  let { output: poolIds } = await sdk.api.abi.multiCall({
    abi: abi.getPoolId,
    calls: poolAddresses.map(i => ({ target: i})),
    block,
  })

  ptis = ptis.map(i => parseInt(i.output))
  const { output: poolBalances } = await sdk.api.abi.multiCall({
    target: BALANCER_VAULT,
    abi: abi.getPoolTokens,
    calls: poolIds.map(i => ({ params: i.output})),
    block,
  })

  poolBalances.forEach(({ output: {balances: poolBalance}, }, i) => sdk.util.sumSingleBalance(balances,transform(poolToTargetMapping[poolAddresses[i]]),poolBalance[1-ptis[i]]))
  return balances
}

module.exports = {
  doublecounted: true,
  methodology:
    "TVL is comprised of the sum of yield-bearing assets in Sense, which includes those assets being used both 1) to issue fixed term Sense tokens (PTs/YTs) and 2) as reserves in our Space AMM Pools. Data is collected via the DeFi Llama SDK.",
  start: DIVIDER_INIT_TS,
  ethereum: {
    tvl,
  },
};

const abi = {
  target: "address:target",
  pools: "function pools(address, uint256) view returns (address)",
  getPoolId: "function getPoolId() view returns (bytes32)",
  pti: "uint256:pti",
  getPoolTokens: "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)",
}
