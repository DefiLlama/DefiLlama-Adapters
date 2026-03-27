const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: {
    marketRegistry: "0xBd45d50611c38E35dD1D1119077De1E988eD2257",
    usmRegistry: "0xAD5620e10C33918E2C6A2E8E53325bf98c548E5e",
    blackList: [],
  },
};

async function getMarkets(api) {
  const { marketRegistry } = config[api.chain];
  const [mintMarkets, borrowMarkets] = await Promise.all([
    api.call({ target: marketRegistry, abi: "address[]:getMintMarkets" }),
    api.call({ target: marketRegistry, abi: "address[]:getBorrowMarkets" }),
  ]);
  return [...new Set([...mintMarkets, ...borrowMarkets].map(m => m.toLowerCase()))];
}

async function getPermissionlessPsms(api) {
  const { usmRegistry } = config[api.chain];
  const usmList = await api.call({ target: usmRegistry, abi: "address[]:getUsmList" });
  if (!usmList.length) return [];

  const accessModes = await api.multiCall({ calls: usmList, abi: "uint8:getAccessMode" });
  return usmList.filter((_, i) => Number(accessModes[i]) === 0);
}

async function tvl(api) {
  const { blackList = [] } = config[api.chain];
  const [markets, psms] = await Promise.all([getMarkets(api), getPermissionlessPsms(api)]);

  const [collateralTokens, borrowTokens] = await Promise.all([
    api.multiCall({ calls: markets, abi: "address:collateralToken", permitFailure: true }),
    api.multiCall({ calls: markets, abi: "address:borrowToken", permitFailure: true }),
  ]);

  const tokensAndOwners = [];
  for (let i = 0; i < markets.length; i++) {
    const collateralToken = collateralTokens[i];
    const borrowToken = borrowTokens[i];
    if (collateralToken && collateralToken !== ADDRESSES.null) {
      tokensAndOwners.push([collateralToken, markets[i]]);
    }
    if (borrowToken && borrowToken !== ADDRESSES.null) {
      tokensAndOwners.push([borrowToken, markets[i]]);
    }
  }

  if (psms.length) {
    const underlyingAssets = await api.multiCall({ calls: psms, abi: "address:UNDERLYING_ASSET" });
    for (let i = 0; i < psms.length; i++) {
      tokensAndOwners.push([underlyingAssets[i], psms[i]]);
    }
  }

  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: blackList });
}

module.exports = {
  methodology: "TVL = collateral balances held by each Alto market, plus underlying assets in permissionless PSMs.",
  ethereum: {
    tvl,
  },
};