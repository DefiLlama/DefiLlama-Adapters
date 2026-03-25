const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require("../helper/cache/getLogs");

const FIXED_LENDING_MARKET = "0x280ddD897F39C33fEf1CbF863B386Cb9a8e53a0e";
const VARIABLE_LENDING_MARKET = "0xc8Db629192a96D6840e88a8451F17655880A2e4D";
const LEGACY_UZR_LENDING_MARKET = "0xa428723eE8ffD87088C36121d72100B43F11fb6A";
const FROM_BLOCK = 23000000;

const lendingMarketGetUserPositionAbi =
  "function getUserPosition(tuple(address, address,address, address,uint256,uint256,address), address) view returns (uint256 supplyAssets, uint256 supplyShares, uint256 borrowAssets, uint256 borrowShares, uint256 collateralAssets)";
const createMarketEventAbi =
  "event CreateMarket(bytes32 indexed id, (address loanToken, address collateralToken, address oracle, address irm, uint256 ltv, uint256 lltv, address whitelist) marketParams)";

const UZR_MARKET_PARAMS = [
  ADDRESSES.ethereum.USD0,
  "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0",
  "0x30Da78355FcEA04D1fa34AF3c318BE203C6F2145",
  "0xdfCF197B0B65066183b04B88d50ACDC0C4b01385",
  "880000000000000000",
  "999900000000000000",
  "0xFE7C47895eDb12a990b311Df33B90Cfea1D44c24",
]

function normalizeMarketLogArg(logArg) {
  const marketParams = logArg.marketParams ?? logArg[1];
  const loanToken = (marketParams.loanToken ?? marketParams[0])?.toString();
  const collateralToken = (marketParams.collateralToken ?? marketParams[1])?.toString();
  const oracle = (marketParams.oracle ?? marketParams[2])?.toString();
  const irm = (marketParams.irm ?? marketParams[3])?.toString();
  const ltv = (marketParams.ltv ?? marketParams[4])?.toString();
  const lltv = (marketParams.lltv ?? marketParams[5])?.toString();
  const whitelist = (marketParams.whitelist ?? marketParams[6])?.toString();
  return [loanToken, collateralToken, oracle, irm, ltv, lltv, whitelist];
}

async function getMarketCreationLogs(api, lendingMarket) {
  return getLogs2({
    api,
    target: lendingMarket,
    fromBlock: FROM_BLOCK,
    eventAbi: createMarketEventAbi,
    useIndexer: true,
  })
}

async function getMarketParams(api, lendingMarket) {
  const logs = await getMarketCreationLogs(api, lendingMarket);
  const uniqueByKey = new Map();
  logs.forEach((logArg) => {
    const params = normalizeMarketLogArg(logArg);
    if (!params[0] || params[0] === "0x0000000000000000000000000000000000000000") return;
    uniqueByKey.set(params.join("-").toLowerCase(), params);
  });

  return Array.from(uniqueByKey.values());
}

async function addFiraTreasuryPositions(api, owners) {
  const [fixedParams, variableParams] = await Promise.all([
    getMarketParams(api, FIXED_LENDING_MARKET),
    getMarketParams(api, VARIABLE_LENDING_MARKET),
  ]);

  const markets = [
    ...fixedParams.map((params) => ({ target: FIXED_LENDING_MARKET, params })),
    ...variableParams.map((params) => ({ target: VARIABLE_LENDING_MARKET, params })),
    { target: LEGACY_UZR_LENDING_MARKET, params: UZR_MARKET_PARAMS },
  ];

  const calls = [];
  owners.forEach(owner => {
    markets.forEach((market) => {
      calls.push({ target: market.target, params: [market.params, owner], marketParams: market.params });
    })
  })

  const positions = await api.multiCall({ abi: lendingMarketGetUserPositionAbi, calls, permitFailure: true })
  positions.forEach((position, i) => {
    if (!position) return;
    const [loanToken, collateralToken] = calls[i].marketParams;
    if (position.collateralAssets > 0) api.add(collateralToken, position.collateralAssets);
    if (position.borrowAssets > 0) api.add(loanToken, -BigInt(position.borrowAssets));
  })
}

module.exports = {
  addFiraTreasuryPositions,
  getMarketParams,
  FIXED_LENDING_MARKET,
  VARIABLE_LENDING_MARKET,
  getMarketCreationLogs,
};
