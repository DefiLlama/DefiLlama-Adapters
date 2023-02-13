const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { get } = require("../helper/http");
const { requery } = require("../helper/requery");
const BigNumber = require("bignumber.js");

const addresses = {
  astar: {
    seanStaking: "0xa86dc743efBc24AF4c1FC5d150AaDb4DCF52c868",
    seanToken: "0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E",
    liquidity: "0x496F6125E1cd31f268032bd4cfaA121D203639b7",
    farm: "0x8e04fbEb4049FD855Cc4aF36A8b198dC7C0e31D0",
  },
};

const urls = {
  astar: {
    liquidityGraph:
      "https://api.subquery.network/sq/Starfish-Finance/starfish-finance-v3",
    framGraph:
      "https://api.subquery.network/sq/Starfish-Finance/starfish-finance-farm",
    api: "https://api2.starfish.finance",
  },
};

const liquidityAddressQuery = gql`
  {
    pools(first: 1000) {
      nodes {
        tokens(orderBy: ID_ASC) {
          nodes {
            address
          }
        }
      }
    }
  }
`;

const farmAddressQuery = gql`
  {
    stakingPools(first: 1000) {
      nodes {
        pool {
          address
        }
      }
    }
  }
`;

const getLlamaPrices = async (coins) => {
  const response = await get(
    `https://coins.llama.fi/prices/current/${coins.join(",")}?searchWidth=4h`
  );
  const formatPrices = {};
  coins.map((key) => {
    const coin = response?.coins?.[key] ?? {};
    formatPrices[key] = coin?.price ?? "";
  });
  return formatPrices;
};

const calcTotalValue = (tokenAmounts, tokenDecimals, tokenPrices) => {
  return Object.entries(tokenAmounts)
    .map((item) => {
      const amount = new BigNumber(item[1]);
      const decimal = 10 ** tokenDecimals[item[0]];
      const price = tokenPrices[item[0]];
      return amount.div(decimal).times(price);
    })
    .reduce((a, c) => a.plus(c), new BigNumber(0));
};

const getLiquidityTokenAddresses = async (chain) => {
  const response = await request(
    urls[chain].liquidityGraph,
    liquidityAddressQuery
  );

  let tokenAddresses = [];
  for (let i = 0; i < response.pools.nodes.length; i++) {
    for (let address of response.pools.nodes[i].tokens.nodes) {
      tokenAddresses.push(address.address);
    }
  }
  return [...new Set(tokenAddresses)];
};

const getFarmLPTokenAddresses = async (chain) => {
  const response = await request(urls[chain].framGraph, farmAddressQuery);

  let tokenAddresses = [];
  for (let i = 0; i < response.stakingPools.nodes.length; i++) {
    const item = response.stakingPools.nodes[i];
    tokenAddresses.push(item.pool.address);
  }
  return [...new Set(tokenAddresses)];
};

const getTokenBalances = async (
  tokenAddresses,
  contractAddress,
  chain,
  block
) => {
  let tokenBalances = await sdk.api.abi.multiCall({
    block,
    calls: tokenAddresses.map((address) => ({
      target: address,
      params: contractAddress,
    })),
    abi: "erc20:balanceOf",
  });

  await requery(tokenBalances, chain, block, "erc20:balanceOf");

  let formatTokenBalances = {};
  let transform = (addr) => `${chain}:${addr}`;
  sdk.util.sumMultiBalanceOf(
    formatTokenBalances,
    tokenBalances,
    true,
    transform
  );
  return formatTokenBalances;
};

const getTokenDecimals = async (tokenAddresses, chain, block) => {
  let tokenDecimals = await sdk.api.abi.multiCall({
    block,
    calls: tokenAddresses.map((target) => ({
      target,
    })),
    abi: "erc20:decimals",
  });

  await requery(tokenDecimals, chain, block, "erc20:decimals");

  const formatTokenDecimals = {};
  tokenAddresses.map(
    (address, i) =>
      (formatTokenDecimals[`${chain}:${address}`] =
        tokenDecimals.output[i].output)
  );
  return formatTokenDecimals;
};

const getTokenPrices = async (tokenAddresses, chain, type) => {
  const coinsArray = tokenAddresses.map((address) => `${chain}:${address}`);

  let formatTokenPrices = await getLlamaPrices(coinsArray);
  const invalidTokenAddresses = Object.keys(formatTokenPrices).map(
    (key) => formatTokenPrices[key] == "" && key.split(":")[1]
  );

  const url = new URL(urls[chain].api + "/v1/platformPrices");
  url.searchParams.append("tokenAddresses", invalidTokenAddresses.join(","));
  url.searchParams.append("type", type);
  const platformPrices = await get(url.toString());

  Object.keys(platformPrices).map((address) => {
    const key = `${chain}:${address}`;
    if (formatTokenPrices.hasOwnProperty(key))
      formatTokenPrices[key] = platformPrices[address];
  });

  return formatTokenPrices;
};

const getLiquidityTvl = async (chain, block) => {
  const tokenAddresses = await getLiquidityTokenAddresses(chain);

  const [formatTokenBalances, formatTokenDecimals, formatTokenPrices] =
    await Promise.all([
      getTokenBalances(
        tokenAddresses,
        addresses[chain].liquidity,
        chain,
        block
      ),
      getTokenDecimals(tokenAddresses, chain, block),
      getTokenPrices(tokenAddresses, chain, "token"),
    ]);

  // console.log(
  //   formatTokenBalances,
  //   formatTokenDecimals,
  //   formatTokenPrices,
  //   "liquidity"
  // );

  return calcTotalValue(
    formatTokenBalances,
    formatTokenDecimals,
    formatTokenPrices
  );
};

const getFarmTvl = async (chain, block) => {
  const tokenAddresses = await getFarmLPTokenAddresses(chain);

  const [formatTokenBalances, formatTokenDecimals, formatTokenPrices] =
    await Promise.all([
      getTokenBalances(tokenAddresses, addresses[chain].farm, chain, block),
      getTokenDecimals(tokenAddresses, chain, block),
      getTokenPrices(tokenAddresses, chain, "lp"),
    ]);

  // console.log(
  //   formatTokenBalances,
  //   formatTokenDecimals,
  //   formatTokenPrices,
  //   "farm"
  // );

  return calcTotalValue(
    formatTokenBalances,
    formatTokenDecimals,
    formatTokenPrices
  );
};

module.exports = { getLiquidityTvl, getFarmTvl, addresses };
