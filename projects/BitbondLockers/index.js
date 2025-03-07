const { get } = require('../helper/http');
const { sumTokens2 } = require("../helper/unwrapLPs");

const { chainMapping, userAgents, metisBaseUrl } = require("./config.json");

async function fetch(networkName) {
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
};

async function tvl(api) {
  const networkName = chainMapping[api.chain];
  const lockers = await fetch(networkName);

  const lockedValues = await api.multiCall({
    abi: "uint256:getLockedTokensAmount",
    calls: lockers.map((locker) => ({ target: locker.address })),
  });

  const tokenAddresses = lockers.map((locker) => (locker.tokenAddress));

  api.addTokens(tokenAddresses, lockedValues)
  
  return sumTokens2({api, resolveLP: true});
}

Object.keys(chainMapping).forEach((chain) => {
  module.exports[chain] = { tvl };
});
