const { getLogs } = require("../helper/cache/getLogs");
const abi = require("../helper/abis/alto.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const PERMISSIONLESS_PSM = "0x4026db9152cEb2e6D376de72Efb70eb8F407A0e4";
const USDC_ETHEREUM = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

const config = {
  ethereum: {
    marketRegistry: "0xBd45d50611c38E35dD1D1119077De1E988eD2257",
    fromBlock: 23982015,
    blackList: [],
  },
};

const eventAbis = {
  mintMarketAdded: "event MintMarketAdded(address indexed market)",
  borrowMarketAdded: "event BorrowMarketAdded(address indexed market)",
};

async function getMarkets(api) {
  const { marketRegistry, fromBlock } = config[api.chain];
  const extraKey = "alto-markets";

  const [mintAdded, borrowAdded] = await Promise.all([
    getLogs({ api, target: marketRegistry, eventAbi: eventAbis.mintMarketAdded, fromBlock, onlyArgs: true, extraKey: `${extraKey}-mint-added` }),
    getLogs({ api, target: marketRegistry, eventAbi: eventAbis.borrowMarketAdded, fromBlock, onlyArgs: true, extraKey: `${extraKey}-borrow-added` }),
  ]);

  const markets = new Set([
    ...mintAdded.map((l) => l.market.toLowerCase()),
    ...borrowAdded.map((l) => l.market.toLowerCase()),
  ]);
  return [...markets];
}

async function tvl(api) {
  const { blackList = [] } = config[api.chain];
  const markets = await getMarkets(api);
  if (markets.length === 0) return api.getBalances();

  const [collateralTokens, borrowTokens] = await Promise.all([
    api.multiCall({ calls: markets, abi: abi.market.collateralToken, permitFailure: true }),
    api.multiCall({ calls: markets, abi: abi.market.borrowToken, permitFailure: true }),
  ]);

  const tokensAndOwners = [];
  const nullAddress = "0x0000000000000000000000000000000000000000";
  for (let i = 0; i < markets.length; i++) {
    const collateralToken = collateralTokens[i];
    const borrowToken = borrowTokens[i];
    if (collateralToken && collateralToken !== nullAddress) {
      tokensAndOwners.push([collateralToken, markets[i]]);
    }
    if (borrowToken && borrowToken !== nullAddress) {
      tokensAndOwners.push([borrowToken, markets[i]]);
    }
  }

  tokensAndOwners.push([USDC_ETHEREUM, PERMISSIONLESS_PSM]);

  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: blackList });
}

async function borrowed(api) {
  const markets = await getMarkets(api);
  if (markets.length === 0) return api.getBalances();

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
  methodology: "TVL = collateral and borrow token (DUSD) balances held by each Alto market, plus USDC in the Permissionless PSM. Borrowed = DUSD borrowed by users (reported separately; total protocol exposure = TVL + borrowed). Mint and borrow markets from MarketRegistry.",
  ethereum: {
    tvl,
    borrowed,
  },
};
