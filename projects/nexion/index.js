const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unknownTokens.js");
const { aaveChainTvl } = require("../helper/aave");
const { getLogs } = require('../helper/cache/getLogs');
const ethers = require("ethers");


// Nexion protocol addresses
let contracts = {
  NEONStaking: "0x00149EF1A0a41083bC3996d026a7c0f32fc5cb73",
  NEON: "0xF2Da3942616880E52e841E5C504B5A9Fba23FFF0",
  gg: "0x8a9eAa66561B87645B14998aDc8AE0472C8B3AD4",
  NEONRaffle: "0x6DCDf944d96d107A25924CF4c4411e39cbC0bd59",
  NEONRaffleDistributor: "0x3CEf1D860cdDE93DCc51667ee5790eF513C5e8DC",
  NEONAuction: "0x9217A44143c3f0aad4Ec4F6771DB97580d3DdfF6",
  NEONVault: "0x8F37162a47aF42D8676e4f5D343a855264EB5591",
  NEONBuynBurn: "0xBd48026E337f1419EC97F780b2045eb0ef2E0467",
  NEONLPStaking: "0x08e9363DE98F0E2414b6DC7a1081c5a29964319e",
  NEONFarm: "0xdF6ec9b93fa473Cb6772dc47326338ecBa374D39",
  OLDNEONFarm: "0x80020303898695b3Ab8017869B6158B49cD5B6CC",
  INC: "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d",
  // Gearbox-style lending protocol addresses
  DataCompressor: '0x88fCeFdb06341282FcdFd0AB6A7f811f7B0010b7',
  ADDRESS_PROVIDER: "0x22165bedc62d5C05a309C8b9AB50EeBd7B411B9E", // Your lending address provider
};

// ABIs for Gearbox-style lending functionality
const lendingAbis = {
  getAddressOrRevert: "function getAddressOrRevert(bytes32 key, uint256 _version) view returns (address result)",
  getCreditManagers: "function getCreditManagers() view returns (address[])",
  underlyingToken: "function underlyingToken() view returns (address)",
  calcTotalValue: "function calcTotalValue(address creditAccount) view returns (uint256 total)",
  creditAccounts: "function creditAccounts() view returns (address[])",
  creditFacade: "function creditFacade() view returns (address addr)",
  version: "function version() view returns (uint256)",
  collateralTokensCount: "function collateralTokensCount() view returns (uint8)",
  getTokenByMask: "function getTokenByMask(uint256 tokenMask) view returns (address token)",
  // Data Compressor V3 ABI - using the correct ABI structure
  getCreditManagersV3List: "function getCreditManagersV3List() view returns (tuple(address addr, string name, uint256 cfVersion, address creditFacade, address creditConfigurator, address underlying, address pool, uint256 totalDebt, uint256 totalDebtLimit, uint256 baseBorrowRate, uint256 minDebt, uint256 maxDebt, uint256 availableToBorrow, address[] collateralTokens, tuple(address targetContract, address adapter)[] adapters, uint256[] liquidationThresholds, uint256 forbiddenTokenMask, uint8 maxEnabledTokensLength, uint16 feeInterest, uint16 feeLiquidation, uint16 liquidationDiscount, tuple(address token, uint16 rate, uint16 quotaIncreaseFee, uint96 totalQuoted, uint96 limit, bool isActive)[] quotas, tuple(address interestModel, uint256 version, uint16 U_1, uint16 U_2, uint16 R_base, uint16 R_slope1, uint16 R_slope2, uint16 R_slope3, bool isBorrowingMoreU2Forbidden) lirm, bool isPaused)[])",

  filtersV2: [
    "event OpenCreditAccount(address indexed onBehalfOf, address indexed creditAccount, uint256 borrowAmount, uint16 referralCode)",
    "event CloseCreditAccount(address indexed borrower, address indexed to)",
    "event LiquidateCreditAccount(address indexed borrower, address indexed liquidator, address indexed to, uint256 remainingFunds)",
    "event TransferAccount(address indexed oldOwner, address indexed newOwner)",
    "event LiquidateExpiredCreditAccount(address indexed borrower, address indexed liquidator, address indexed to, uint256 remainingFunds)",
  ],
};



const COLLATERALS = {
  DAI: ADDRESSES.pulse.DAI,
  WPLS: ADDRESSES.pulse.WPLS,
  DAIPLS_LP: "0xE56043671df55dE5CDf8459710433C10324DE0aE"
};


// Gearbox-style lending functions using DataCompressor V3
async function getCreditManagersV3(block, api) {
  // Use hardcoded DataCompressor address directly
  return await api.call({
    abi: lendingAbis.getCreditManagersV3List,
    target: contracts.DataCompressor, // 0x88fCeFdb06341282FcdFd0AB6A7f811f7B0010b7
    block,
  });
}

async function gearboxStyleTVL(timestamp, ethBlock, chainBlocks, { api }) {
  const block = await api.getBlock();

  // Get live data from DataCompressor
  const creditManagers = await getCreditManagersV3(block, api);

  creditManagers.forEach((cm) => {
    if (cm.totalDebt && cm.totalDebt !== "0") {
      // Add the debt in the underlying token - DeFiLlama will handle USD conversion
      api.add(cm.underlying, cm.totalDebt);
    }
  });

  return api.getBalances();
}

async function combinedTVL(timestamp, ethBlock, chainBlocks, { api }) {
  // Get farm/staking TVL
  const farmTvl = await sumTokensExport({
    owners: [contracts.NEONFarm, contracts.OLDNEONFarm],
    tokens: [COLLATERALS.DAI, COLLATERALS.WPLS, ADDRESSES.null],
    useDefaultCoreAssets: true,
    lps: [COLLATERALS.DAIPLS_LP]
  })(timestamp, ethBlock, chainBlocks, { api });

  // Get lending/borrowed TVL
  const lendingTvl = await gearboxStyleTVL(timestamp, ethBlock, chainBlocks, { api });

  // Combine both TVLs
  Object.keys(farmTvl).forEach(token => {
    api.add(token, farmTvl[token]);
  });

  Object.keys(lendingTvl).forEach(token => {
    api.add(token, lendingTvl[token]);
  });

  return api.getBalances();
}

module.exports = {
  methodology: "NEON can be staked in the protocol, Farms hold PLS-DAI LP from user deposits that can be withdrawn after 500days. Also lending supports 10 pools currently.",

  pulse: {
    tvl: combinedTVL,
    staking: sumTokensExport({
      owners: [contracts.NEONStaking],
      tokens: [contracts.NEON],
      useDefaultCoreAssets: true,
      lps: ['0xEd15552508E5200f0A2A693B05dDd3edEF59e624']
    }),
  },
};
