const { gql, request } = require("graphql-request");
const { getLogs } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const { solidityPackedKeccak256 } = require('ethers')

const CONFIG = {
  arbitrum: 'https://api.0xgraph.xyz/api/public/e2146f32-5728-4755-b1d1-84d17708c119/subgraphs/clamm-arbitrum/prod/gn',
  sonic: 'https://api.0xgraph.xyz/api/public/e2146f32-5728-4755-b1d1-84d17708c119/subgraphs/clamm-sonic/prod/gn',
  base: 'https://api.0xgraph.xyz/api/public/e2146f32-5728-4755-b1d1-84d17708c119/subgraphs/clamm-base/prod/gn',
  blast: 'https://api.0xgraph.xyz/api/public/e2146f32-5728-4755-b1d1-84d17708c119/subgraphs/clamm-blast/prod/gn',
  mantle: 'https://api.0xgraph.xyz/api/public/e2146f32-5728-4755-b1d1-84d17708c119/subgraphs/clamm-mantle/prod/gn'
}

// Current CLAMM markets (https://clamm.stryke.xyz/en/earn), read from chain: option
// markets registered on the FeeStrategy, and the pool positions their handlers mint
const CURRENT = {
  robinhood: {
    feeStrategy: '0x56b8221882e4707f998f3e9717fbdfde628ed1b2', fromBlock: 65228887,
    handlers: [['0x67599652ec14f635837929b4c08b1adc10f83300', 65228887], ['0x02a81b0eb603d1e228c4f3e5ed756e8b6ee64f11', 68671942]],
  },
  arbitrum: {
    feeStrategy: '0x11d27d84e21dc88eb8c8aef3a1f9b869b5f95a87', fromBlock: 379445413,
    handlers: [['0x6f73afb6598d7a3881577f884f2e01574aefc373', 379716358]],
  },
}

const mintEvent = 'event LogMintPositionHandler((address pool,address hook,int24 tickLower,int24 tickUpper,uint128 liquidity) params,address context,uint256 amount0,uint256 amount1)'

const abi = "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)";

const query = gql`
  query strikes($limit: Int!, $skip: Int!) {
    strikes(
      first: $limit
      skip: $skip
      where: { totalLiquidity_gt: "100" }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      pool
      token0 {
        id
      }
      token1 {
        id
      }
      tickLower
      tickUpper
      totalLiquidity
    }
  }
`;

async function fetchStrikes(endpoint, limit, skip, allData = []) {
  const variables = { limit, skip };
  const { strikes } = await request(endpoint, query, variables);
  allData.push(...strikes);

  if (strikes.length === limit) return fetchStrikes(endpoint, limit, skip + limit, allData);

  return allData;
}

function addV3PositionBalances(strike, sqrtPricesMap) {
  const tickToPrice = (tick) => 1.0001 ** tick;
  const token0 = strike.token0.id;
  const token1 = strike.token1.id;
  const liquidity = strike.totalLiquidity;
  const bottomTick = +strike.tickLower;
  const topTick = +strike.tickUpper;
  const tick = +sqrtPricesMap[strike.pool.toLowerCase()].tick;
  const sa = tickToPrice(bottomTick / 2);
  const sb = tickToPrice(topTick / 2);

  let amount0 = 0;
  let amount1 = 0;

  if (tick < bottomTick) {
    amount0 = (liquidity * (sb - sa)) / (sa * sb);
  } else if (tick < topTick) {
    const price = tickToPrice(tick);
    const sp = price ** 0.5;

    amount0 = (liquidity * (sb - sp)) / (sp * sb);
    amount1 = liquidity * (sp - sa);
  } else {
    amount1 = liquidity * (sb - sa);
  }

  return { token0, amount0, token1, amount1 };
}

async function currentTvl(api) {
  const { feeStrategy, fromBlock, handlers } = CURRENT[api.chain]
  const block = await api.getBlock()
  if (block < fromBlock) return
  const markets = await getLogs({ api, target: feeStrategy, fromBlock, eventAbi: 'event OptionMarketRegistered(address optionMarket)', onlyArgs: true }).then(l => [...new Set(l.map(i => i.optionMarket))])
  const pools = new Set((await api.multiCall({ abi: 'address:primePool', calls: markets })).map(p => p.toLowerCase()))
  const callAssets = await api.multiCall({ abi: 'address:callAsset', calls: markets })
  const putAssets = await api.multiCall({ abi: 'address:putAsset', calls: markets })

  // each handler owns one pool position per tick range, shared by all hooks
  const positions = {}
  for (const [handler, handlerFromBlock] of handlers) {
    if (block < handlerFromBlock) continue
    const logs = await getLogs({ api, target: handler, fromBlock: handlerFromBlock, eventAbi: mintEvent, onlyArgs: true })
    logs.filter(({ params: p }) => pools.has(p.pool.toLowerCase())).forEach(({ params: p }) => {
      const key = solidityPackedKeccak256(['address', 'int24', 'int24'], [handler, p.tickLower, p.tickUpper])
      positions[p.pool.toLowerCase() + key] = { pool: p.pool, key, tickLower: Number(p.tickLower), tickUpper: Number(p.tickUpper) }
    })
  }
  const rows = Object.values(positions)
  const uniquePools = [...new Set(rows.map(p => p.pool))]
  const liquidity = await api.multiCall({ abi: 'function positions(bytes32) view returns (uint128 liquidity)', calls: rows.map(p => ({ target: p.pool, params: [p.key] })) })
  const slot0 = await api.multiCall({ abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick)', calls: uniquePools })
  const token0 = await api.multiCall({ abi: 'address:token0', calls: uniquePools })
  const token1 = await api.multiCall({ abi: 'address:token1', calls: uniquePools })
  rows.forEach((p, i) => {
    const j = uniquePools.indexOf(p.pool)
    addUniV3LikePosition({ api, token0: token0[j], token1: token1[j], liquidity: Number(liquidity[i]), tickLower: p.tickLower, tickUpper: p.tickUpper, tick: Number(slot0[j].tick) })
  })
  // option markets hold the liquidity taken out of the pools for open options
  return api.sumTokens({ ownerTokens: markets.map((m, i) => [[callAssets[i], putAssets[i]], m]) })
}

const tvl = async (api) => {
  const chain = api.chain
  if (chain === 'base' || chain === 'mantle' || chain === 'blast' || chain === 'sonic') return
  const endpoint = CONFIG[chain]
  const limit = 1000
  const allData = await fetchStrikes(endpoint, limit, 0)

  let pools = allData.map((strike) => strike.pool.toLowerCase());
    pools = [...new Set(pools)];
    const sqrtPrices = await api.multiCall({ calls: pools, abi });
    const sqrtPricesMap = sqrtPrices.reduce((acc, item, i) => {
      return { ...acc, [pools[i]]: item };
  }, {});

  allData.forEach((strike) => {
    const { token0, amount0, token1, amount1 } = addV3PositionBalances(strike, sqrtPricesMap);
      api.add(token0, amount0);
      api.add(token1, amount1);
    });
  if (CURRENT[chain]) await currentTvl(api)
  };

module.exports = {
  doublecounted: true, // tokens are stored in UNI-V3 pools,
  methodology: 'Value of Stryke liquidity positions across supported chains. Current Robinhood and Arbitrum markets count the AMM positions owned by their handlers, plus assets held by registered option markets. The underlying LP assets overlap with their AMM listings.'
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})

module.exports.robinhood = { start: '2026-09-17', tvl: currentTvl }
