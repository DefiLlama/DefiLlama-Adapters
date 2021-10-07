const sdk = require("@defillama/sdk");
const retry = require("async-retry");
const { GraphQLClient, request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const BigNumber = require("bignumber.js");

const bscGraphUrl =
  "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph";

const polygonGraphUrl =
  "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-polygon";

const fantomGraphUrl =
  "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-fantom";

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
    target: "0x0487b824c8261462f88940f97053e65bdb498446",
    owner: "0x63d6EC1cDef04464287e2af710FFef9780B6f9F5",
    chain: "bsc",
  });
  const wingsBalance = BigNumber(output)
    .times(10 ** -18)
    .toNumber();
  const wingsPrice = await getWingsPrice();
  return wingsBalance * wingsPrice;
}

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
  const stakedWings = await bscWingsStaking(chainBlocks);
  return toUSDTBalances(
    Number(results.uniswapFactories[0].totalLiquidityUSD) + stakedWings
  );
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
    target: "0x845E76A8691423fbc4ECb8Dd77556Cb61c09eE25",
    owner: "0x4e22399070aD5aD7f7BEb7d3A7b543e8EcBf1d85",
    chain: "polygon",
  });
  const wingsBalance = BigNumber(output)
    .times(10 ** -18)
    .toNumber();
  const wingsPrice = await getPWingsPrice();
  return wingsBalance * wingsPrice;
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
  const stakedWings = await polygonWingsStaking(chainBlocks);
  return toUSDTBalances(
    Number(results.uniswapFactories[0].totalLiquidityUSD) + stakedWings
  );
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
    target: "0x3D8f1ACCEe8e263F837138829B6C4517473d0688",
    owner: "0x9180583C1ab03587b545629dd60D2be0bf1DF4f2",
    chain: "fantom",
  });
  const wingsBalance = BigNumber(output)
    .times(10 ** -18)
    .toNumber();
  const wingsPrice = await getFWingsPrice();
  return wingsBalance * wingsPrice;
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
  const stakedWings = await fantomWingsStaking(chainBlocks);
  return toUSDTBalances(
    Number(results.uniswapFactories[0].totalLiquidityUSD) + stakedWings
  );
}

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  fantom: {
    tvl: fantomTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl, fantomTvl]),
};