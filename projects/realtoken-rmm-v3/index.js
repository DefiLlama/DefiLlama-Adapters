const methodologies = require("../helper/methodologies");

// RealT RMM v3 is an Aave-fork money market on Gnosis. Its collateral is RealT
// "Wrapped USD" tokens (e.g. RTW-USD-01) that have no external market price, so
// the market exposes its own Aave price oracle to value every reserve. We price
// supply and borrows through that oracle (base unit = 1e8, USD).
const DATA_PROVIDER = "0x11B45acC19656c6C52f93d8034912083AC7Dd756";
const ORACLE = "0xb4AE809Ad7CEB7e5B579dEdD0De7c213aD5AB516";

const abi = {
  getAllATokens: "function getAllATokens() view returns (tuple(string symbol, address tokenAddress)[])",
  getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
  getAssetsPrices: "function getAssetsPrices(address[] assets) view returns (uint256[])",
  BASE_CURRENCY_UNIT: "uint256:BASE_CURRENCY_UNIT",
};

async function getMarket(api) {
  const aTokens = (await api.call({ target: DATA_PROVIDER, abi: abi.getAllATokens })).map((i) => i.tokenAddress);
  const underlyings = await api.multiCall({ abi: "address:UNDERLYING_ASSET_ADDRESS", calls: aTokens });
  const [reserveTokens, prices, baseUnit, decimals] = await Promise.all([
    api.multiCall({ target: DATA_PROVIDER, abi: abi.getReserveTokensAddresses, calls: underlyings }),
    api.call({ target: ORACLE, abi: abi.getAssetsPrices, params: [underlyings] }),
    api.call({ target: ORACLE, abi: abi.BASE_CURRENCY_UNIT }),
    api.multiCall({ abi: "uint8:decimals", calls: underlyings }),
  ]);
  return { aTokens, underlyings, reserveTokens, prices, baseUnit, decimals };
}

function addUsd(api, amounts, decimals, prices, baseUnit) {
  const SCALE = 10n ** 18n; // keep fractional precision through integer math
  const base = BigInt(baseUnit);
  amounts.forEach((amount, i) => {
    const denom = 10n ** BigInt(decimals[i]) * base;
    const usdScaled = (BigInt(amount) * BigInt(prices[i]) * SCALE) / denom;
    api.addUSDValue(Number(usdScaled) / 1e18);
  });
}

async function tvl(api) {
  const { aTokens, underlyings, prices, baseUnit, decimals } = await getMarket(api);
  const supplied = await api.multiCall({ abi: "erc20:balanceOf", calls: aTokens.map((aToken, i) => ({ target: underlyings[i], params: aToken })) });
  addUsd(api, supplied, decimals, prices, baseUnit);
}

async function borrowed(api) {
  const { reserveTokens, prices, baseUnit, decimals } = await getMarket(api);
  const variableDebt = await api.multiCall({ abi: "erc20:totalSupply", calls: reserveTokens.map((r) => r.variableDebtTokenAddress) });
  const stableDebt = await api.multiCall({ abi: "erc20:totalSupply", calls: reserveTokens.map((r) => r.stableDebtTokenAddress) });
  const debt = variableDebt.map((v, i) => (BigInt(v) + BigInt(stableDebt[i])).toString());
  addUsd(api, debt, decimals, prices, baseUnit);
}

module.exports = {
  // supply/borrow values are reported in USD (priced via the market oracle), not the underlying tokens
  misrepresentedTokens: true,
  methodology: methodologies.lendingMarket,
  xdai: { tvl, borrowed },
};
