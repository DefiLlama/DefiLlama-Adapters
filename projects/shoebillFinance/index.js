const { toUSDTBalances } = require("../helper/balances");

const shoebillDataProviderAddress =
  "0xBdc26Ba6a0ebFD83c76CEf76E8F9eeb7714A5884";
const shoebillDataProviderAddressForKava =
  "0xb2631276eE6524C6A7f205600F44E1408F21235F";
const protocolDataProviderAbi =
  "function getAllAggregatedReservesData() view returns (tuple(tuple(string internalSymbol, address internalAddress, string externalSymbol, address externalAddress, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress) token, tuple(uint256 ltv, uint256 liquidationThreshold, uint256 liquidationBonus, uint256 reserveFactor, bool usageAsCollateralEnabled, bool borrowingEnabled, bool stableBorrowRateEnabled, bool isActive, bool isFrozen, uint256 decimals) configuration, tuple(uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp, bool isCollateral, address yieldAddress) overview, uint256 oraclePrice)[])";

const getTvl = async (api, providerAddress) => {
  const aggregatedData = await api.call({
    target: providerAddress,
    abi: protocolDataProviderAbi,
  });

  const data = aggregatedData
    .filter((i) => i.overview)
    .map((e) => {
      return {
        address: e.token.externalAddress,
        tvl:
          (e.overview.availableLiquidity * e.oraclePrice) /
          10 ** e.configuration.decimals,
      };
    });
  const totalSupplyTvl = data.reduce((a, b) => a + +b.tvl, 0) / 1e8;

  return toUSDTBalances(totalSupplyTvl);
};
async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  return await getTvl(api, shoebillDataProviderAddress);
}
async function tvlKava(timestamp, ethBlock, chainBlocks, { api }) {
  return await getTvl(api, shoebillDataProviderAddressForKava);
}

const getBorrowed = async (api, providerAddress) => {
  const aggregatedData = await api.call({
    target: providerAddress,
    abi: protocolDataProviderAbi,
  });

  const data = aggregatedData.map((e) => {
    return {
      borrowed:
        (e.overview.totalVariableDebt * e.oraclePrice) /
        10 ** e.configuration.decimals,
    };
  });
  const borrowed = data.reduce((a, b) => a + b.borrowed, 0) / 1e8;

  return toUSDTBalances(borrowed);
};

async function borrowed(timestamp, ethBlock, chainBlocks, { api }) {
  return await getBorrowed(api, shoebillDataProviderAddress);
}
async function borrowedKava(timestamp, ethBlock, chainBlocks, { api }) {
  return await getBorrowed(api, shoebillDataProviderAddressForKava);
}
module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  klaytn: {
    tvl,
    borrowed,
  },
  kava: {
    tvl: tvlKava,
    borrowed: borrowedKava,
  },
};
