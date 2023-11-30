const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('../helper/abis/aave.json');

const addressesProviderRegistry = '0x01b76559D512Fa28aCc03630E8954405BcBB1E02';
const balanceOfAbi = "function balanceOf(address account) view returns (uint256)";
const getLpAbi = "function getLendingPool() view returns (address)";
const getReserveDataAbi = "function getReserveData(address asset) view returns (uint256 reserveConfigurationMap, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)";
const getUnderlyingAbi = "function getTokenAmounts(uint amount) external view returns (uint token0Amount, uint token1Amount)";
const token0Abi = "function TOKEN0() view returns (address token, uint8 decimals)";
const token1Abi = "function TOKEN1() view returns (address token, uint8 decimals)";

// Aave helper doesnt recognize tokenized Uniswap positions, need to manually

async function tvl(timestamp, ethBlock, _, { api }) {
  const addressesProviders = await api.call({ target: addressesProviderRegistry, abi: abi["getAddressesProvidersList"], })
  const validAddressesProviders = addressesProviders.filter((ap) => ap != ADDRESSES.null)
  const lendingPools = await api.multiCall({ calls: validAddressesProviders, abi: getLpAbi, })
  const aTokens = await api.multiCall({ calls: lendingPools, abi: abi["getReservesList"], })

  const ge = {}
  lendingPools.forEach((v, i) => {
    ge[v] = { aTokens: aTokens[i] }
  })

  await Promise.all(
    Object.keys(ge).map(async (pool) => {
      const aTokens = ge[pool].aTokens;
      const aTokenAddresses = (await api.multiCall({ abi: getReserveDataAbi, calls: aTokens, target: pool })).map(i => i.aTokenAddress)
      const bals = (await api.multiCall({ abi: balanceOfAbi, calls: aTokenAddresses.map((v, i) => ({ target: aTokens[i], params: v })) }))
      const underlyings = await api.multiCall({ abi: getUnderlyingAbi, calls: aTokens.map((v, i) => ({ target: v, params: bals[i] })), permitFailure: true, })
      const token0s = await api.multiCall({ abi: token0Abi, calls: aTokens, permitFailure: true, })
      const token1s = await api.multiCall({ abi: token1Abi, calls: aTokens, permitFailure: true, })
      underlyings.forEach((v, i) => {
        if (v) {
          api.add(token0s[i].token, v.token0Amount)
          api.add(token1s[i].token, v.token1Amount)
        } else {
          api.add(aTokens[i], bals[i])
        }
      })
    })
  )
}


module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  arbitrum: { tvl, }
};
