const { sumTokens2 } = require("../helper/unwrapLPs");

const ADMIN_ADDRESSES = {
  plasma: "0xe0a8d5d839f65Ef787E13C50D29d9Aa31353fa31",
};

const STABILITY_POOL = {
  plasma: "0x537bAe42577595fEE200fC646a52D8b79B851c4A",
};

const USDVE_TOKEN = {
  plasma: "0x0AE246586Ee3CaE3629A7bE512fE99bD95b7714D",
};

async function tvl(api) {
  const adminContract = ADMIN_ADDRESSES[api.chain];
  const stabilityPool = STABILITY_POOL[api.chain];
  const usdveToken = USDVE_TOKEN[api.chain];
  
  // Get collateral locked in Active Pool
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
  
  // Add USDVE locked in Stability Pool
  await sumTokens2({ 
    api, 
    tokens: [usdveToken], 
    owner: stabilityPool, 
  });
}

module.exports = {
  methodology:
    "TVL counts collateral locked in the Active Pool and USDVE deposited in the Stability Pool, which provides liquidity for liquidations.",
  start: '2025-10-31', // Thursday, October 31, 2025
};

Object.keys(ADMIN_ADDRESSES).forEach((chain) => {
  module.exports[chain] = { tvl };
});

