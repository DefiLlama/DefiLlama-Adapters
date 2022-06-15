const sdk = require("@defillama/sdk");
const axios = require("axios");
const retry = require("async-retry");
const { toUSDTBalances } = require("../helper/balances");

async function getTvls(serviceName, key) {
  const response = await retry(async (_) =>
    axios.get("https://api.stkr.io/v1alpha/metrics")
  );
  const idx = response.data.services.findIndex(
    (service) => service.serviceName === serviceName
  );
  return idx > -1 ? response.data.services[idx][key] : 0;
}

async function getETHTvl() {
  return toUSDTBalances(await getTvls("eth", "totalStakedUsd"));
}

async function getBscTvl() {
  return toUSDTBalances(await getTvls("bnb", "totalStakedUsd"));
}

async function getAvaxTvl() {
  return toUSDTBalances(await getTvls("avax", "totalStakedUsd"));
}

async function getFantomTvl() {
  return toUSDTBalances(await getTvls("ftm", "totalStakedUsd"));
}

async function getPolygonTvl() {
  return toUSDTBalances(await getTvls("polygon", "totalStakedUsd"));
}

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([getETHTvl, getPolygonTvl]),
  },
  bsc: {
    tvl: getBscTvl,
  },
  avalanche: {
    tvl: getAvaxTvl,
  },
  fantom: {
    tvl: getFantomTvl,
  },
  methodology: `We get the total staked amount and total staked USD from Ankr's official API.`,
};
