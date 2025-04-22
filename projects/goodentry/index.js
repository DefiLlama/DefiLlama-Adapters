const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('../helper/abis/aave.json');
const { getLogs } = require('../helper/cache/getLogs')

const addressesProviderRegistry = '0x01b76559D512Fa28aCc03630E8954405BcBB1E02';
const balanceOfAbi = "function balanceOf(address account) view returns (uint256)";
const getLpAbi = "function getLendingPool() view returns (address)";
const getReserveDataAbi = "function getReserveData(address asset) view returns (uint256 reserveConfigurationMap, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)";
const getUnderlyingAbi = "function getTokenAmounts(uint amount) external view returns (uint token0Amount, uint token1Amount)";
const token0Abi = "function TOKEN0() view returns (address token, uint8 decimals)";
const token1Abi = "function TOKEN1() view returns (address token, uint8 decimals)";
// v2 getReserves ABI
const vaultReservesAbi = "function getReserves() view returns (uint baseAmount, uint quoteAmount, uint valueX8)";
const factory = "0xddec418c1a825ac09ad83cc1a28a2c5bcd746050"

async function tvl(api) {
  // GoodEntry v1
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

  const logs = await getLogs({ api, target: factory, eventAbi: 'event VaultCreated(address vault, address baseToken, address quoteToken, address vaultUpgradeableBeacon)', onlyArgs: true, fromBlock: 155743986, })
  const vaults = logs.map(log => log.vault)

  // GoodEntry v2
  let reserves = await api.multiCall({ calls: vaults, abi: vaultReservesAbi })
  reserves.forEach((v, i) => {
    api.add(logs[i].baseToken, v.baseAmount)
    api.add(logs[i].quoteToken, v.quoteAmount)
  })

}


module.exports = {
  methodology:
    "For GoodEntry v1, counts the tokens locked in the Aave lending pool fork. For v2, calls a dedicated getReserves() function on the vault.",
  hallmarks: [
    [1701376109, "V2 Launch"]
  ],
  arbitrum: { tvl, }
};