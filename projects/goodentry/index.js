const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('../helper/abis/aave.json');

const addressesProviderRegistry = '0x01b76559D512Fa28aCc03630E8954405BcBB1E02';
const balanceOfAbi = "function balanceOf(address account) view returns (uint256)";
const getLpAbi = "function getLendingPool() view returns (address)";
const getReserveDataAbi = "function getReserveData(address asset) view returns (uint256 reserveConfigurationMap, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id)";
const getUnderlyingAbi = "function getTokenAmounts(uint amount) external view returns (uint token0Amount, uint token1Amount)";
const token0Abi = "function TOKEN0() view returns (address token, uint8 decimals)";
const token1Abi = "function TOKEN1() view returns (address token, uint8 decimals)";
// v2 getReserves ABI
const vaultReservesAbi = "function getReserves() view returns (uint baseAmount, uint quoteAmount, uint valueX8)";


// Existing v2 vaults: { vaultAddress: {name, base, quote} }
const v2vaults = [
  { address: "0x1ba92C53BFe8FD1D81d84B8968422192B73F4475", name: "ARB-USDC.e UNIv3", base: ADDRESSES.arbitrum.ARB, quote: ADDRESSES.arbitrum.USDC },
  { address: "0xd5fE1A54fA642400ef559d866247cCE66049141B", name: "ARB-USDC.e Camelot", base: ADDRESSES.arbitrum.ARB, quote: ADDRESSES.arbitrum.USDC },
  { address: "0x419ae989a629Cc71834BDf6E3e8E33c9c3ED3Bb4", name: "ARB-USDC Camelot", base: ADDRESSES.arbitrum.ARB, quote: ADDRESSES.arbitrum.USDC_CIRCLE },
  { address: "0x36003A975bFC56f650590C26B1479ba423217931", name: "ETH-USDC.e Camelot", base: ADDRESSES.arbitrum.WETH, quote: ADDRESSES.arbitrum.USDC },
  { address: "0xd666156C473Cc9539CAaCc112B3A3590a895C861", name: "ETH-USDC Camelot", base: ADDRESSES.arbitrum.WETH, quote: ADDRESSES.arbitrum.USDC_CIRCLE },
  { address: "0x21EB68Cc5a5d51b48e0DE743f321151523b7A15D", name: "GMX-USDC Camelot", base: ADDRESSES.arbitrum.GMX, quote: ADDRESSES.arbitrum.USDC_CIRCLE },
  { address: "0x5f6aB9b043C43FaB8D2A51EA85b70495B5EeFD15", name: "WBTC-USDC Camelot", base: ADDRESSES.arbitrum.WBTC, quote: ADDRESSES.arbitrum.USDC_CIRCLE },
]


async function tvl(timestamp, ethBlock, _, { api }) {
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

  // GoodEntry v2
  let reserves = (await api.multiCall({ calls: v2vaults.map(v => v.address), abi: vaultReservesAbi})).map((v, i) => {return { res: v, ...v2vaults[i]} })
  reserves.forEach( v => {
    api.add(v.base, v.res.baseAmount)
    api.add(v.quote, v.res.quoteAmount)
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
