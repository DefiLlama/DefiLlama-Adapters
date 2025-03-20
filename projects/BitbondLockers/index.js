const { getConfig } = require('../helper/cache');
const { get } = require('../helper/http');
const { sumUnknownTokens } = require('../helper/unknownTokens');
const { isLP } = require("../helper/unwrapLPs");

const { chainMapping, userAgents, metisBaseUrl } = require("./config.json");

async function fetchLockers(networkName) {
  let contracts = [];
  let currentPage = 1;
  let isLastPage = false;

  while (!isLastPage) {
    const response = await get(
      `${metisBaseUrl}/${networkName}/token-lockers?page=${currentPage}&perPage=100`,
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
  const lockers = await getConfig(`bitbond/locker/${networkName}`, undefined, {
    fetcher: () => fetchLockers(networkName)
  });
  const tokens = lockers.map((locker) => locker.tokenAddress);
  const symbols  = await api.multiCall({  abi: 'string:symbol', calls: tokens, permitFailure: true, })
  const tokensAndOwners = []
  tokens.forEach((token, i) => {
    const symbol = symbols[i]
    if (isLP(symbol, token, api.chain)) {
      tokensAndOwners.push([token, lockers[i].address])
    }
  })

  return sumUnknownTokens({api, resolveLP: true, useDefaultCoreAssets: true, tokensAndOwners, });
}

Object.keys(chainMapping).forEach((chain) => {
  module.exports[chain] = { tvl };
});
