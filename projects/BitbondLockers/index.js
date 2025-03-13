const { get } = require('../helper/http');
const { sumTokens2 } = require("../helper/unwrapLPs");

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
  const lockers = await fetchLockers(networkName);

  const lockedValues = await api.multiCall({
    abi: "erc20:balanceOf",
    calls: lockers.map((locker) => ({ target: locker.tokenAddress, params: [locker.address] })),
    requery: true
  });

  const tokenAddresses = lockers.map((locker) => (locker.tokenAddress));

  api.addTokens(tokenAddresses, lockedValues)
  
  return sumTokens2({api, resolveLP: true});
}

Object.keys(chainMapping).forEach((chain) => {
  module.exports[chain] = { tvl };
});
