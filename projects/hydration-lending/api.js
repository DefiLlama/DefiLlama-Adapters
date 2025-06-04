const sdk = require('@defillama/sdk')
const { ethers } = require('ethers')

// Lending pool constants
const RPC_ENDPOINT = "https://hydration-rpc.n.dwellir.com"
const UI_POOL_DATA_PROVIDER = "0x112b087b60C1a166130d59266363C45F8aa99db0"
const POOL_ADDRESS_PROVIDER = "0xf3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691"

// Token mapping with decimals and UI names
const TOKEN_MAP = {
  "0x0000000000000000000000000000000100000016": { symbol: "USDC", decimals: 6 },
  "0x000000000000000000000000000000010000000a": { symbol: "USDT", decimals: 6 },
  "0x0000000000000000000000000000000100000013": { symbol: "WBTC", decimals: 8 },
  "0x0000000000000000000000000000000100000005": { symbol: "DOT", decimals: 10 },
  "0x000000000000000000000000000000010000000f": { symbol: "vDOT", decimals: 10 },
  "0x00000000000000000000000000000001000f453d": { symbol: "tBTC", decimals: 18 }, // Corrected key
  "0x00000000000000000000000000000001000002b2": { symbol: "GDOT", decimals: 18 }, // Corrected key
}

const cgMapping = {
  DAI: 'dai',
  INTR: 'interlay',
  GLMR: 'moonbeam',
  vDOT: 'voucher-dot',
  ZTG: 'zeitgeist',
  CFG: 'centrifuge',
  BNC: 'bifrost-native-coin',
  WETH: 'ethereum',
  DOT: 'polkadot',
  APE: 'apecoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  ASTR: 'astar',
  WBTC: 'wrapped-bitcoin',
  iBTC: 'interbtc',
}

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT)

const abi = {
  getReservesData: "function getReservesData(address provider) view returns (tuple(address underlyingAsset, string name, string symbol, uint256 decimals, uint256 baseLTVasCollateral, uint256 reserveLiquidationThreshold, uint256 reserveLiquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 liquidityRate, uint128 variableBorrowRate, uint128 stableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint256 availableLiquidity, uint256 totalPrincipalStableDebt, uint256 averageStableRate, uint256 stableDebtLastUpdateTimestamp, uint256 totalScaledVariableDebt, uint256 priceInMarketReferenceCurrency, address priceOracle, uint256 variableRateSlope1, uint256 variableRateSlope2, uint256 stableRateSlope1, uint256 stableRateSlope2, uint256 baseStableBorrowRate, uint256 baseVariableBorrowRate, uint256 optimalUsageRatio, bool isPaused, bool isSiloedBorrowing, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt, bool flashLoanEnabled, uint256 debtCeiling, uint256 debtCeilingDecimals, uint8 eModeCategoryId, uint256 borrowCap, uint256 supplyCap, uint16 eModeLtv, uint16 eModeLiquidationThreshold, uint16 eModeLiquidationBonus, address eModePriceSource, string eModeLabel, bool borrowableInIsolation)[], tuple(uint256 marketReferenceCurrencyUnit, int256 marketReferenceCurrencyPriceInUsd, int256 networkBaseTokenPriceInUsd, uint8 networkBaseTokenPriceDecimals))",
}

function formatReserveLiquidity(reserve) {
  const tokenDecimals = Number(reserve.decimals)
  const availableLiquidity = reserve.availableLiquidity.toString()
  const borrowedAmount = (BigInt(reserve.totalPrincipalStableDebt) + 
                        BigInt(reserve.totalScaledVariableDebt)).toString()
  const symbol = TOKEN_MAP[reserve.underlyingAsset.toLowerCase()]?.symbol || reserve.symbol
  const cgId = cgMapping[symbol] || symbol.toLowerCase()
  return {
    symbol,
    availableLiquidity,
    borrowedAmount,
    cgId,
    decimals: tokenDecimals,
  }
}

async function lendingTvl(api) {
  const contract = new ethers.Contract(UI_POOL_DATA_PROVIDER, [abi.getReservesData], provider)
  const [reservesData] = await contract.getReservesData(POOL_ADDRESS_PROVIDER)

  for (const reserve of reservesData) {
    if (!reserve.isActive || reserve.isFrozen) continue
    const { cgId, availableLiquidity, decimals } = formatReserveLiquidity(reserve)
    const normalized = Number(availableLiquidity) / (10 ** decimals)
    api.add(cgId, normalized, { skipChain: true })
  }

  return api.getBalances()
}

async function borrowedTvl(api) {
  const contract = new ethers.Contract(UI_POOL_DATA_PROVIDER, [abi.getReservesData], provider)
  const [reservesData] = await contract.getReservesData(POOL_ADDRESS_PROVIDER)

  for (const reserve of reservesData) {
    if (!reserve.isActive || reserve.isFrozen) continue
    const { cgId, borrowedAmount, decimals } = formatReserveLiquidity(reserve)
    const normalized = Number(borrowedAmount) / (10 ** decimals)
    api.add(cgId, normalized, { skipChain: true })
  }

  return api.getBalances()
}

module.exports = {
  lendingTvl,
  borrowedTvl,
}