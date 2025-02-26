const { getCache } = require('../helper/http');
const { sumTokens2 } = require("../helper/unwrapLPs");

const { chains } = require("./config.json");

async function fetch(networkName) {
  const response = await getCache(
    `https://metis.bitbond.com/api/${networkName}/defillama/lockers`
  );
  console.log("response", response);
  return response.meta.contracts;
}

async function tvl(api) {
  const networkName = chains[api.chain];
  const lockers = await fetch(networkName);

  const lockedValues = await api.multiCall({
    abi: "uint256:getLockedTokensAmount",
    calls: lockers.map((locker) => ({ target: locker.address })),
  });

  const tokenAddresses = lockers.map((locker) => (locker.tokenAddress));

  api.addTokens(tokenAddresses, lockedValues)
  
  return sumTokens2({api, resolveLP: true});
}

Object.keys(chains).forEach((chain) => {
  module.exports[chain] = { tvl };
});
