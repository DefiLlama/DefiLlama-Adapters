const { sumTokens2 } = require("../helper/unwrapLPs");

const ADMIN_ADDRESSES = {
  plasma: "0xe0a8d5d839f65Ef787E13C50D29d9Aa31353fa31",
};

async function tvl(api) {
  const adminContract = ADMIN_ADDRESSES[api.chain];
  const collAddresses = await api.call({ 
    abi: "address[]:getValidCollateral", 
    target: adminContract, 
  });
  const activePool = await api.call({ 
    abi: "address:activePool", 
    target: adminContract, 
  });
  await sumTokens2({ 
    api, 
    tokens: collAddresses, 
    owner: activePool, 
  });
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Vaultedge platform",
  start: '2025-10-31', // Thursday, October 31, 2025
};

Object.keys(ADMIN_ADDRESSES).forEach((chain) => {
  module.exports[chain] = { tvl };
});

