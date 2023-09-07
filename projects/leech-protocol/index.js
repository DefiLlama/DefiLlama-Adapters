const axios = require("axios");
const sdk = require("@defillama/sdk");

const poolsUrl = "https://pc.leechprotocol.com/pool-data/lama";

const chainIndexes = {
  'bsc': 56,
  'avax': 43114,
  'optimism': 10,
}


const baseToken = {
  56: '0x55d398326f99059fF775485246999027B3197955',
  10: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
  43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
}

async function getPoolData(chainIndex) {
  return axios.get(`${poolsUrl}/${chainIndex}`)
}
async function getCoingeckoPrice(coingeckoId) {
  return axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&precision=2`);
}

async function bscTvl(_, _1, _2, { api }) {
  const CONTEXT_CHAIN_NAME = 'bsc'
  const { data: pools } = await getPoolData(chainIndexes[CONTEXT_CHAIN_NAME]);

  await Promise.all(
    pools.items.map(async (pool) => {
      if (pool.name === "strategy-thena") {

      const [{ data: token0price }, { data: token1price }] = await Promise.all([
          getCoingeckoPrice(pool?.token0CoingeckoId),
          getCoingeckoPrice(pool?.token1CoingeckoId)
        ]);

      const [
        { output: totalAmounts }, { output: totalSupply }, { output: balance }
      ] = await Promise.all([
        callGetTotalAmounts(pool.lpAddress, CONTEXT_CHAIN_NAME),
        callTotalSupply(pool.lpAddress, CONTEXT_CHAIN_NAME),
        callBalance(pool.address, CONTEXT_CHAIN_NAME)
      ])

      const lpPrice = (
        ((totalAmounts[0] * token0price[pool?.token0CoingeckoId].usd * 1e18) / 1e18 +
            totalAmounts[1] * token1price[pool?.token1CoingeckoId].usd * 1e9) /
        totalSupply
      ).toString();

      api.add(baseToken[pool.chainIndex], lpPrice * balance);
    }

    if (pool.name === "strategy-biswap-farm") {
      const [{ data: token0price }, { data: token1price }] =
        await Promise.all([
          getCoingeckoPrice(pool?.token0CoingeckoId),
          getCoingeckoPrice(pool?.token1CoingeckoId)
        ]);

      const [
        { output: totalAmounts }, { output: balance }, { output: totalSupply }
      ] = await Promise.all([
        callGetReserves(pool.lpAddress, CONTEXT_CHAIN_NAME),
        callBalance(pool.address, CONTEXT_CHAIN_NAME),
        callTotalSupply(pool.lpAddress, CONTEXT_CHAIN_NAME)
      ])

      const lpPrice = (
        (totalAmounts[0] * token0price[pool.token0CoingeckoId].usd * 1e18) / 1e18 +
        (totalAmounts[1] * token1price[pool.token1CoingeckoId].usd * 1e18) / 1e18
      ) / totalSupply

      await api.add(baseToken[pool.chainIndex], balance * lpPrice);
    }
    if (pool.name === "strategy-venus-supl") {
      const { output: venusTvl } = await callBalanceOfUnderlying(pool.address, CONTEXT_CHAIN_NAME);

      await api.add(baseToken[pool.chainIndex], venusTvl);
    }
  }));

}

async function avaxTvl(_, _1, _2, { api }) {
  const CONTEXT_CHAIN_NAME = 'avax'
  const { data: pools } = await getPoolData(chainIndexes[CONTEXT_CHAIN_NAME]);

  await Promise.all(pools.items.map(async (pool) => {
        if (pool.name === "strategy-yak") {
          const { output: yakTvl } = await callBalanceOfUnderlying(pool.address, CONTEXT_CHAIN_NAME);

          await api.add(baseToken[pool.chainIndex], yakTvl);
        }
      }));
}

async function optimismTvl(_, _1, _2, { api }) {
  const CONTEXT_CHAIN_NAME = 'optimism'
  const { data: pools } = await getPoolData(chainIndexes[CONTEXT_CHAIN_NAME]);

  await Promise.all(
    pools.items.map(async (pool) => {
        if (pool.name === "sushi-opt") {

          const [{ data: token0price }, { data: token1price }] = await Promise.all([
              getCoingeckoPrice(pool?.token0CoingeckoId),
              getCoingeckoPrice(pool?.token1CoingeckoId)
            ]);

          const [{ output: reserves },{ output: balance }, { output: totalSupply }] = await Promise.all([
            callGetReserves(pool.lpAddress, CONTEXT_CHAIN_NAME),
            callBalance(pool.address, CONTEXT_CHAIN_NAME),
            callTotalSupply(pool.lpAddress, CONTEXT_CHAIN_NAME)
          ])

          const lpPrice = (
              (reserves[0] * token0price[pool.token0CoingeckoId].usd * 1e18) / 1e18 +
              (reserves[1] * token1price[pool.token1CoingeckoId].usd * 1e18) / 1e18
            )
            / totalSupply

          api.add(baseToken[pool.chainIndex], balance * lpPrice);
        }
      }));
}

async function callTotalSupply(target, chain) {
  return sdk.api.abi.call({
    target, chain,
    abi: "function totalSupply() public view returns (uint256)",
  })
}
async function callBalance(target, chain) {
  return sdk.api.abi.call({
    target, chain,
    abi: "function balance() public view returns (uint256)",
  })
}
async function callGetReserves(target, chain) {
  return sdk.api.abi.call({
    target, chain,
    abi: "function getReserves() public view returns (uint256, uint256)",
  })
}
async function callGetTotalAmounts(target, chain) {
  return sdk.api.abi.call({
    target, chain,
    abi: "function getTotalAmounts() public view returns (uint256, uint256)"
  })
}
async function callBalanceOfUnderlying(target, chain) {
  return sdk.api.abi.call({
    target, chain,
    abi: "function balanceOfUnderlying() public view returns (uint256)",
  })
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  bsc: {
    tvl: bscTvl
  },
  avax: {
    tvl: avaxTvl
  },
  optimism: {
    tvl: optimismTvl
  }
};