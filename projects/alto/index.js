const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("../helper/abis/alto.json");
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
    api.call({ target: marketRegistry, abi: abi.marketRegistry.getMintMarkets }),
    api.call({ target: marketRegistry, abi: abi.marketRegistry.getBorrowMarkets }),
  ]);
  return [...new Set([...mintMarkets, ...borrowMarkets].map(m => m.toLowerCase()))];
}

async function getPermissionlessPsms(api) {
  const { usmRegistry } = config[api.chain];
  const usmList = await api.call({ target: usmRegistry, abi: abi.usmRegistry.getUsmList });
  if (!usmList.length) return [];

  const accessModes = await api.multiCall({ calls: usmList, abi: abi.usm.getAccessMode });
  return usmList.filter((_, i) => Number(accessModes[i]) === 0);
}

async function tvl(api) {
  const { blackList = [] } = config[api.chain];
  const [markets, psms] = await Promise.all([getMarkets(api), getPermissionlessPsms(api)]);

  const [collateralTokens, borrowTokens] = await Promise.all([
    api.multiCall({ calls: markets, abi: abi.market.collateralToken, permitFailure: true }),
    api.multiCall({ calls: markets, abi: abi.market.borrowToken, permitFailure: true }),
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
    const underlyingAssets = await api.multiCall({ calls: psms, abi: abi.usm.underlyingAsset });
    for (let i = 0; i < psms.length; i++) {
      tokensAndOwners.push([underlyingAssets[i], psms[i]]);
    }
  }

  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: blackList });
}

async function borrowed(api) {
  const markets = await getMarkets(api);
  if (!markets.length) return;

  const [borrowTokens, totalBorroweds] = await Promise.all([
    api.multiCall({ calls: markets, abi: abi.market.borrowToken, permitFailure: true }),
    api.multiCall({ calls: markets, abi: abi.market.totalBorrowed, permitFailure: true }),
  ]);

  for (let i = 0; i < markets.length; i++) {
    const borrowToken = borrowTokens[i];
    const totalBorrowed = totalBorroweds[i];
    if (borrowToken && totalBorrowed && totalBorrowed.assets !== undefined) {
      api.add(borrowToken, totalBorrowed.assets);
    }
  }
}

module.exports = {
  methodology: "TVL = collateral and borrow token balances held by each Alto market, plus underlying assets in permissionless PSMs. Borrowed = total DUSD borrowed across all markets.",
  ethereum: {
    tvl,
    borrowed,
  },
};