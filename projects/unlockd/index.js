const sdk = require("@defillama/sdk");

const abi = {
  getSimpleReservesData: "function getSimpleReservesData(address provider) view returns (tuple(address underlyingAsset, string name, string symbol, uint256 decimals, uint256 reserveFactor, bool borrowingEnabled, bool isActive, bool isFrozen, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 liquidityRate, uint128 variableBorrowRate, uint40 lastUpdateTimestamp, address uTokenAddress, address debtTokenAddress, address interestRateAddress, uint256 availableLiquidity, uint256 totalVariableDebt, uint256 priceInEth, uint256 variableRateSlope1, uint256 variableRateSlope2)[])",
  getSimpleNftsData: "function getSimpleNftsData(address provider) view returns (tuple(address underlyingAsset, string name, string symbol, bool isActive, bool isFrozen, address uNftAddress, uint256 totalCollateral)[])",
}
const address = require("./helper/address");
const chain = 'ethereum'

async function tvl(_, _1, _2, { api }) {
  const balances = {}
  const simpleReservesData = await api.call({
    target: address.UiPoolDataProvider[chain],
    params: [address.LendPoolAddressProvider[chain]],
    abi: abi.getSimpleReservesData,
  });
  simpleReservesData.map(i => sdk.util.sumSingleBalance(balances, i.underlyingAsset, i.availableLiquidity, chain))

  return balances;
}

async function borrowed(_, _1, _2, { api }) {
  const balances = {}
  const simpleReservesData = await api.call({
    target: address.UiPoolDataProvider[chain],
    params: [address.LendPoolAddressProvider[chain]],
    abi: abi.getSimpleReservesData,
  })
  simpleReservesData.map(i => sdk.util.sumSingleBalance(balances, i.underlyingAsset, i.totalVariableDebt, chain))

  return balances;
}

module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL`,
  ethereum: {
    tvl,
    borrowed,
  },
};
