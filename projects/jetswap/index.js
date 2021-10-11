const sdk = require("@defillama/sdk");
const retry = require("async-retry");
const { GraphQLClient, request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const BigNumber = require("bignumber.js");

const WINGS_TOKEN_BSC = "0x0487b824c8261462f88940f97053e65bdb498446";
const WINGS_TOKEN_POLYGON = "0x845E76A8691423fbc4ECb8Dd77556Cb61c09eE25";
const WINGS_TOKEN_FANTOM = "0x3D8f1ACCEe8e263F837138829B6C4517473d0688";

const MASTER_BSC = "0x63d6EC1cDef04464287e2af710FFef9780B6f9F5";
const MASTER_POLYGON = "0x4e22399070aD5aD7f7BEb7d3A7b543e8EcBf1d85";
const MASTER_FANTOM = "0x9180583C1ab03587b545629dd60D2be0bf1DF4f2";

const bscGraphUrl =
  "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph";

const polygonGraphUrl =
  "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-polygon";

const fantomGraphUrl =
  "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-fantom";

async function bscTvl(timestamp, block, chainBlocks) {
  var graphQLClient = new GraphQLClient(bscGraphUrl);

  var query = gql`
    {
      uniswapFactories(first: 5) {
        totalLiquidityUSD
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return toUSDTBalances(Number(results.uniswapFactories[0].totalLiquidityUSD));
}

async function polygonTvl(timestamp, block, chainBlocks) {
  var graphQLClient = new GraphQLClient(polygonGraphUrl);

  var query = gql`
    {
      uniswapFactories(first: 5) {
        totalLiquidityUSD
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return toUSDTBalances(Number(results.uniswapFactories[0].totalLiquidityUSD));
}

async function fantomTvl(timestamp, block, chainBlocks) {
  var graphQLClient = new GraphQLClient(fantomGraphUrl);

  var query = gql`
    {
      uniswapFactories(first: 5) {
        totalLiquidityUSD
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return toUSDTBalances(Number(results.uniswapFactories[0].totalLiquidityUSD));
}

async function getWingsPrice() {
  const wingsPriceQuery = gql`
    query get_wings_reserve($block: Int) {
      pair(id: "0xfba740304f3fc39d0e79703a5d7788e13f877dc0") {
        reserve0
        reserveUSD
      }
    }
  `;
  const { pair } = await request(bscGraphUrl, wingsPriceQuery);
  const wingsReserve = pair.reserveUSD / 2;
  const wingsPrice = wingsReserve / pair.reserve0;
  return wingsPrice;
}

async function bscWingsStaking(chainBlocks) {
  const { output } = await sdk.api.erc20.balanceOf({
    block: chainBlocks["bsc"],
    target: WINGS_TOKEN_BSC,
    owner: MASTER_BSC,
    chain: "bsc",
  });
  const wingsBalance = BigNumber(output)
    .times(10 ** -18)
    .toNumber();
  const wingsPrice = await getWingsPrice();
  return wingsBalance * wingsPrice;
}

async function getPWingsPrice() {
  const priceQuery = gql`
    query get_wings_reserve($block: Int) {
      pair(id: "0xaf623e96d38191038c48990df298e07fb77b56c3") {
        reserve0
        reserveUSD
      }
    }
  `;
  const { pair } = await request(polygonGraphUrl, priceQuery);
  const wingsReserve = pair.reserveUSD / 2;
  const wingsPrice = wingsReserve / pair.reserve0;
  return wingsPrice;
}

async function polygonWingsStaking(chainBlocks) {
  const { output } = await sdk.api.erc20.balanceOf({
    block: chainBlocks["polygon"],
    target: WINGS_TOKEN_POLYGON,
    owner: MASTER_POLYGON,
    chain: "polygon",
  });
  const wingsBalance = BigNumber(output)
    .times(10 ** -18)
    .toNumber();
  const wingsPrice = await getPWingsPrice();
  return wingsBalance * wingsPrice;
}

async function getFWingsPrice() {
  const priceQuery = gql`
    query get_wings_reserve($block: Int) {
      pair(id: "0x89ff795017ae21a8696d371f685cd02fc219f56f") {
        reserve0
        reserveUSD
      }
    }
  `;
  const { pair } = await request(fantomGraphUrl, priceQuery);
  const wingsReserve = pair.reserveUSD / 2;
  const wingsPrice = wingsReserve / pair.reserve0;
  return wingsPrice;
}

async function fantomWingsStaking(chainBlocks) {
  const { output } = await sdk.api.erc20.balanceOf({
    block: chainBlocks["fantom"],
    target: WINGS_TOKEN_FANTOM,
    owner: MASTER_FANTOM,
    chain: "fantom",
  });
  const wingsBalance = BigNumber(output)
    .times(10 ** -18)
    .toNumber();
  const wingsPrice = await getFWingsPrice();
  return wingsBalance * wingsPrice;
}

async function poolsTvl(timestamp, ethBlock, chainBlocks) {
  const bscStakedWings = await bscWingsStaking(chainBlocks);
  const polygonStakedWings = await polygonWingsStaking(chainBlocks);
  const fantomStakedWings = await fantomWingsStaking(chainBlocks);
  return toUSDTBalances(
    bscStakedWings + polygonStakedWings + fantomStakedWings
  );
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  staking: {
    tvl: poolsTvl,
  },
  methodology:
    "TVL comes from the DEX liquidity pools, staking TVL is accounted as WINGS on 0x63d6EC1cDef04464287e2af710FFef9780B6f9F5, pWINGS on 0x4e22399070aD5aD7f7BEb7d3A7b543e8EcBf1d85, fWINGS on 0x9180583C1ab03587b545629dd60D2be0bf1DF4f2",
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl, fantomTvl]),
};