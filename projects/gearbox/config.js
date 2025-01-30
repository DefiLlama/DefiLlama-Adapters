// src/adapter/constants.ts
const ADDRESS_PROVIDER_V3 = {
  ethereum: "0x9ea7b04da02a5373317d745c1571c84aad03321d",
  arbitrum: "0x7d04eCdb892Ae074f03B5D0aBA03796F90F3F2af",
  optimism: "0x3761ca4BFAcFCFFc1B8034e69F19116dD6756726",
};

const CONTRACTS_REGISTER = "0x434f4e5452414354535f52454749535445520000000000000000000000000000" // cast format-bytes32-string "CONTRACTS_REGISTER"
const DATA_COMPRESSOR = "0x444154415f434f4d50524553534f520000000000000000000000000000000000" // cast format-bytes32-string "DATA_COMPRESSOR"

// src/adapter/pools/abi.ts
const poolAbis = {
  getAddressOrRevert: "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  getPools: "function getPools() view returns (address[])",
  underlyingToken: "function underlyingToken() view returns (address)",
};

// src/adapter/v1/abi.ts
const v1Abis = {
  getAddressOrRevert: "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  getCreditManagers: "function getCreditManagers() view returns (address[])",
  version: "function version() view returns (uint256)",
  underlyingToken: "function underlyingToken() view returns (address)",
  calcTotalValue: "function calcTotalValue(address creditAccount) view returns (uint256 total)",
  creditFilter: "function creditFilter() view returns (address addr)",
  filtersV1: [
    "event CloseCreditAccount(address indexed owner, address indexed to, uint256 remainingFunds)",
    "event OpenCreditAccount(address indexed sender, address indexed onBehalfOf, address indexed creditAccount, uint256 amount, uint256 borrowAmount, uint256 referralCode)",
    "event RepayCreditAccount(address indexed owner, address indexed to)",
    "event TransferAccount(address indexed oldOwner, address indexed newOwner)",
    "event LiquidateCreditAccount(address indexed owner, address indexed liquidator, uint256 remainingFunds)",
  ],
};

// src/adapter/v2/abi.ts
const v2Abis = {
  calcTotalValue: "function calcTotalValue(address creditAccount) view returns (uint256 total)",
  getAddressOrRevert: "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  getCreditManagersV2List: "function getCreditManagersV2List() view returns (tuple(address addr, string name, uint256 cfVersion, address creditFacade, address creditConfigurator, address underlying, address pool, uint256 totalDebt, uint256 totalDebtLimit, uint256 baseBorrowRate, uint256 minDebt, uint256 maxDebt, uint256 availableToBorrow, address[] collateralTokens, tuple(address targetContract, address adapter)[] adapters, uint256[] liquidationThresholds, bool isDegenMode, address degenNFT, uint256 forbiddenTokenMask, uint8 maxEnabledTokensLength, uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, uint16 feeLiquidationExpired, uint16 liquidationDiscountExpired, tuple(address token, uint16 rate, uint16 quotaIncreaseFee, uint96 totalQuoted, uint96 limit, bool isActive)[] quotas, tuple(address interestModel, uint256 version, uint16 U_1, uint16 U_2, uint16 R_base, uint16 R_slope1, uint16 R_slope2, uint16 R_slope3, bool isBorrowingMoreU2Forbidden) lirm, bool isPaused)[])",
  creditFacade: "function creditFacade() view returns (address addr)",
  newConfigurator: "event NewConfigurator(address indexed newConfigurator)",
  creditFacadeUpgraded: "event CreditFacadeUpgraded(address indexed newCreditFacade)",
  filtersV2: [
    "event OpenCreditAccount(address indexed onBehalfOf, address indexed creditAccount, uint256 borrowAmount, uint16 referralCode)",
    "event CloseCreditAccount(address indexed borrower, address indexed to)",
    "event LiquidateCreditAccount(address indexed borrower, address indexed liquidator, address indexed to, uint256 remainingFunds)",
    "event TransferAccount(address indexed oldOwner, address indexed newOwner)",
    "event LiquidateExpiredCreditAccount(address indexed borrower, address indexed liquidator, address indexed to, uint256 remainingFunds)",
  ],
};

// src/adapter/v3/abi.ts
const v3Abis = {
  getAddressOrRevert: "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  getCreditManagersV3List: "function getCreditManagersV3List() view returns (tuple(address addr, string name, uint256 cfVersion, address creditFacade, address creditConfigurator, address underlying, address pool, uint256 totalDebt, uint256 totalDebtLimit, uint256 baseBorrowRate, uint256 minDebt, uint256 maxDebt, uint256 availableToBorrow, address[] collateralTokens, tuple(address targetContract, address adapter)[] adapters, uint256[] liquidationThresholds, bool isDegenMode, address degenNFT, uint256 forbiddenTokenMask, uint8 maxEnabledTokensLength, uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, uint16 feeLiquidationExpired, uint16 liquidationDiscountExpired, tuple(address token, uint16 rate, uint16 quotaIncreaseFee, uint96 totalQuoted, uint96 limit, bool isActive)[] quotas, tuple(address interestModel, uint256 version, uint16 U_1, uint16 U_2, uint16 R_base, uint16 R_slope1, uint16 R_slope2, uint16 R_slope3, bool isBorrowingMoreU2Forbidden) lirm, bool isPaused)[])",
  getCreditAccountsByCreditManager: "function getCreditAccountsByCreditManager(address creditManager, (address token, bytes callData)[] priceUpdates) returns ((bool isSuccessful, address[] priceFeedsNeeded, address addr, address borrower, address creditManager, string cmName, address creditFacade, address underlying, uint256 debt, uint256 cumulativeIndexLastUpdate, uint128 cumulativeQuotaInterest, uint256 accruedInterest, uint256 accruedFees, uint256 totalDebtUSD, uint256 totalValue, uint256 totalValueUSD, uint256 twvUSD, uint256 enabledTokensMask, uint256 healthFactor, uint256 baseBorrowRate, uint256 aggregatedBorrowRate, (address token, uint256 balance, bool isForbidden, bool isEnabled, bool isQuoted, uint256 quota, uint16 quotaRate, uint256 quotaCumulativeIndexLU)[] balances, uint64 since, uint256 cfVersion, uint40 expirationDate, address[] activeBots)[])",
  creditAccounts: "function creditAccounts() view returns (address[])",
  collateralTokensCount: "function collateralTokensCount() view returns (uint8)",
  getTokenByMask: "function getTokenByMask(uint256 tokenMask) view returns (address token)",
};

module.exports = {
  ADDRESS_PROVIDER_V3,
  CONTRACTS_REGISTER,
  DATA_COMPRESSOR,
  poolAbis,
  v1Abis,
  v2Abis,
  v3Abis
}