const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http');
const { sumTokens2 } = require("../helper/unwrapLPs");

const chainMapping = {
  "arbitrum": "arbitrum",
  "avax": "avalanche",
  "base": "base",
  "bsc": "bsc",
  "ethereum": "ethereum",
  "optimism": "optimism",
  "polygon": "polygon"
};
const metisBaseUrl = "https://metis.bitbond.com/api/defillama";
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
];

async function fetchSales(networkName) {
  let contracts = [];
  let currentPage = 1;
  let isLastPage = false;

  while (!isLastPage) {
    const response = await get(
      `${metisBaseUrl}/${networkName}/token-sales?page=${currentPage}&perPage=100`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": getRandomUserAgent(),
        }
      }
    );

    contracts.push(...response.meta.contracts);

    const pagination = response.meta.pagination;
    isLastPage = pagination ? pagination.isLastPage : true;
    currentPage = pagination ? pagination.nextPage : currentPage;
  }

  return contracts;
}

function getRandomUserAgent() {
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

async function tvl(api) {
  const networkName = chainMapping[api.chain];
  const sales = await getConfig(`bitbond/sales/${networkName}`, undefined, {
    fetcher: () => fetchSales(networkName)
  });
  const tokensAndOwners = sales.map((sale) => [sale.currencyAddress, sale.address]);
  return sumTokens2({ api, tokensAndOwners });
}

Object.keys(chainMapping).forEach((chain) => {
  module.exports[chain] = { tvl };
});
