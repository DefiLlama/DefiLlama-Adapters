const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Fira fixed-rate and variable-rate lending-market contracts
const FIXED_LENDING_MARKET = "0x280ddD897F39C33fEf1CbF863B386Cb9a8e53a0e".toLowerCase();
const VARIABLE_LENDING_MARKET = "0xc8Db629192a96D6840e88a8451F17655880A2e4D".toLowerCase();
const LEGACY_UZR_LENDING_MARKET = "0xa428723eE8ffD87088C36121d72100B43F11fb6A".toLowerCase(); 
const LEGACY_UZR_MARKET_ID = "0xa597b5a36f6cc0ede718ba58b2e23f5c747da810bf8e299022d88123ab03340e".toLowerCase();

// LendingMarket ABI: market(Id) returns supply/borrow totals (no accrued interest snapshot semantics)
const marketAbi =
  "function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)";

// LendingMarket emits CreateMarket(Id indexed id, MarketParams marketParams)
const createMarketEventAbi =
  "event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 ltv, uint256 lltv, address whitelist) marketParams)";

 
const FROM_BLOCK = 23000000;

const marketsCache = {};

function normalizeMarketLogArg(logArg) {
  // When using getLogs({ onlyArgs: true }), ethers returns a Result-like object.
  // We keep this parsing robust across possible field name differences.
  const id = (logArg.id ?? logArg[0]).toString().toLowerCase();
  const marketParams = logArg.marketParams ?? logArg[1];

  const loanToken = (marketParams.loanToken ?? marketParams[0]).toString().toLowerCase();
  const collateralToken = (marketParams.collateralToken ?? marketParams[1]).toString().toLowerCase();

  return { id, loanToken, collateralToken };
}

async function getMarketsAndTokens(api, lendingMarket) {
  const key = lendingMarket.toLowerCase();
  if (marketsCache[key]) return marketsCache[key];

  const logs = await (async () => {
    try {
      return await getLogs({
        api,
        target: lendingMarket,
        fromBlock: FROM_BLOCK,
        eventAbi: createMarketEventAbi,
        onlyArgs: true,
        useIndexer: true,
      });
    } catch (e) {
      return await getLogs({
        api,
        target: lendingMarket,
        fromBlock: FROM_BLOCK,
        eventAbi: createMarketEventAbi,
        onlyArgs: true,
      });
    }
  })();

  const byId = new Map();
  const tokens = new Set();

  for (const logArg of logs) {
    const { id, loanToken, collateralToken } = normalizeMarketLogArg(logArg);
    if (!id || loanToken === "0x0000000000000000000000000000000000000000") continue;

    byId.set(id, { id, loanToken, collateralToken });
    tokens.add(loanToken);
    tokens.add(collateralToken);
  }

  const res = {
    markets: Array.from(byId.values()),
    tokens: Array.from(tokens).filter(Boolean),
  };

  marketsCache[key] = res;
  return res;
}

async function tvl(api) {
  const [fixed, variable, uzr] = await Promise.all([
    getMarketsAndTokens(api, FIXED_LENDING_MARKET),
    getMarketsAndTokens(api, VARIABLE_LENDING_MARKET),
    getMarketsAndTokens(api, LEGACY_UZR_LENDING_MARKET),
  ]);
  console.log(fixed, variable, uzr);

  const tokens = Array.from(new Set([...fixed.tokens, ...variable.tokens,...uzr.tokens ]));
  console.log(tokens);
  // TVL must not include borrowed amounts: we only sum the coins actually held by the fixed/variable
  // lending-market contracts (cash reserves + posted collateral).
  return sumTokens2({
    api,
    owners: [FIXED_LENDING_MARKET, VARIABLE_LENDING_MARKET, LEGACY_UZR_LENDING_MARKET],
    tokens,
    resolveLP: false,
    resolveUniV3: false,
  });
}

async function borrowed(api) {
  // Borrowed is tracked separately from TVL.
  // we compute borrowed debt from fixed-rate markets only. For variable markets we use the same methodology as morpho.
  const fixed = await getMarketsAndTokens(api, FIXED_LENDING_MARKET);

  // Include legacy UZR fixed market explicitly. It may not be discoverable via current CreateMarket logs.
  const fixedMarkets = [...fixed.markets, { id: LEGACY_UZR_MARKET_ID, loanToken:   ADDRESSES.ethereum.USD0, target: LEGACY_UZR_LENDING_MARKET }];
  const marketData = await api.multiCall({
    abi: marketAbi,
    calls: fixedMarkets.map((m) => ({ target: m.target ?? FIXED_LENDING_MARKET, params: [m.id] })),
    permitFailure: true,
  });

  fixedMarkets.forEach((m, i) => {
    const data = marketData[i];
    if (!data || data.totalBorrowAssets == null) return;

    const borrow = BigInt(data.totalBorrowAssets.toString());
    if (borrow > 0n) api.add(m.loanToken, borrow.toString());
  });
}

module.exports = {
  methodology:
    "TVL: Total value of all coins held in the smart contracts of the protocol (fixed + variable lending markets).\n" +
    "Borrowed: Total value of outstanding debt across live Fira markets.",
  ethereum: {
    tvl,
    borrowed,
  },
  doublecounted: true,
};
