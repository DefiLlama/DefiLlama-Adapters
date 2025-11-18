const { getLogs } = require('./cache/getLogs')
const ADDRESSES = require('./coreAssets.json')
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const abi = require('./abis/aave.json');
const { getChainTransform, getFixBalances, } = require('../helper/portedTokens')
const { sumTokens2, } = require('../helper/unwrapLPs');
const methodologies = require('./methodologies');

async function getV2Reserves(api, addressesProviderRegistry, dataHelperAddress, { abis = {}, v3 } = {}) {
  let validProtocolDataHelpers

  const _abi = {
    getAddressesProvidersList: abi.getAddressesProvidersList,
    getAddress: abi.getAddress,
    getReservesList: abi.getReservesList,
    getReserveData: v3 ? abi.getReserveDataV3 : abi.getReserveData,
  }

  if (abis)
    Object.entries(abis).forEach(([k, v]) => _abi[k] = v)

  if (dataHelperAddress === undefined) {
    const addressesProviders = await api.call({ target: addressesProviderRegistry, abi: _abi.getAddressesProvidersList, })


    const protocolDataHelpers = await api.multiCall({
      calls: addressesProviders.map((provider) => ({
        target: provider,
        params: "0x0100000000000000000000000000000000000000000000000000000000000000",
      })),
      abi: _abi.getAddress,
    })


    validProtocolDataHelpers = protocolDataHelpers.filter((helper) => helper !== ADDRESSES.null)

    if (!validProtocolDataHelpers.length) {
      console.log('No valid protocol data helpers found for', api.chain, addressesProviders)
      const lendingPools = await api.multiCall({ calls: addressesProviders, abi: 'address:getLendingPool', })
      const aTokenAddresses = []
      const reserveAddresses = []
      const borrowedAmounts = []

      for (const lendingPool of lendingPools) {
        const reserves = await api.call({ target: lendingPool, abi: _abi.getReservesList, })
        const reserveData = await api.multiCall({ calls: reserves, abi: _abi.getReserveData, target: lendingPool, })
        reserves.forEach((reserve, i) => {
          reserveAddresses.push(reserve)
          aTokenAddresses.push(reserveData[i].aTokenAddress)
        })


        if (v3) {
          const supplyVariable = await api.multiCall({ abi: 'erc20:totalSupply', calls: reserveData.map(i => i.variableDebtTokenAddress), })
          const supplyStable = await api.multiCall({ abi: 'erc20:totalSupply', calls: reserveData.map(i => i.stableDebtTokenAddress), })
          reserveData.forEach((_, idx) => {
            let value = +supplyVariable[idx] + +supplyStable[idx]
            borrowedAmounts.push(value)
          })
        } else {
          reserveData.forEach((data) => {
            borrowedAmounts.push(+data.totalVariableDebt + +data.totalStableDebt)
          })
        }


      }

      return [aTokenAddresses, reserveAddresses, undefined, borrowedAmounts]
    }
  } else {
    validProtocolDataHelpers = dataHelperAddress
  }

  const aTokenMarketData = await api.multiCall({ calls: validProtocolDataHelpers, abi: abis.getAllATokens || abi["getAllATokens"], })

  let aTokenAddresses = [];
  aTokenMarketData.map((aTokensData) => {
    aTokenAddresses = [
      ...aTokenAddresses,
      ...aTokensData.map((aToken) => aToken[1]),
    ];
  });

  const underlyingAddressesData = await api.multiCall({ calls: aTokenAddresses, abi: abi["getUnderlying"], })
  const reserveAddresses = underlyingAddressesData
  return [aTokenAddresses, reserveAddresses, validProtocolDataHelpers[0]]
}

async function getTvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddress) {
  if (!transformAddress) transformAddress = id => id
  const balanceOfUnderlying = await sdk.api.abi.multiCall({
    calls: v2Atokens.map((aToken, index) => ({
      target: v2ReserveTokens[index],
      params: aToken,
    })),
    abi: "erc20:balanceOf",
    block,
    chain
  });
  sdk.util.sumMultiBalanceOf(balances, balanceOfUnderlying, true, transformAddress)
}

async function getBorrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress, v3 = false, { borrowedAmounts } = {}) {
  if (!transformAddress) transformAddress = id => id
  if (borrowedAmounts) {
    borrowedAmounts.forEach((amount, idx) => {
      sdk.util.sumSingleBalance(balances, transformAddress(v2ReserveTokens[idx]), amount)
    })
    return balances
  }
  const reserveData = await sdk.api.abi.multiCall({
    calls: v2ReserveTokens.map((token) => ({
      target: dataHelper,
      params: [token],
    })),
    abi: v3 ? abi.getTotalDebt : abi.getHelperReserveData,
    block,
    chain
  });

  reserveData.output.forEach((data, idx) => {
    const quantity = v3 ? data.output : BigNumber(data.output.totalVariableDebt).plus(data.output.totalStableDebt).toFixed(0)
    sdk.util.sumSingleBalance(balances, transformAddress(data.input.params[0]), quantity)
  })
}

function aaveChainTvl(_chain, addressesProviderRegistry, transformAddressRaw, dataHelperAddresses, borrowed, v3 = false, { abis = {}, oracle, blacklistedTokens = [], hasV2LPs = false, } = {}) {
  return async (api) => {
    const chain = api.chain
    const block = api.block
    const balances = {}
    const { transformAddress, fixBalances, v2Atokens, v2ReserveTokens, dataHelper, updateBalances, borrowedAmounts, } = await getData({ api, oracle, chain, block, addressesProviderRegistry, dataHelperAddresses, transformAddressRaw, abis, v3, })
    if (borrowed) {
      await getBorrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress, v3, { borrowedAmounts, });
    } else {
      await getTvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddress);
    }
    if (updateBalances) updateBalances(balances)
    fixBalances(balances)
    Object.keys(balances).forEach((key) => {
      if (!blacklistedTokens.length) return;
      if (blacklistedTokens.some(i => new RegExp(i, 'gi').test(key))) {
        delete balances[key]
      }
    })
    if (hasV2LPs) await sumTokens2({ block, resolveLP: true, balances, chain, })
    return balances
  }
}
function aaveExports(_chain, addressesProviderRegistry, transform = undefined, dataHelpers = undefined, { oracle, abis, v3 = false, blacklistedTokens = [], hasV2LPs = false, } = {}) {
  return {
    tvl: aaveChainTvl(_chain, addressesProviderRegistry, transform, dataHelpers, false, v3, { oracle, abis, blacklistedTokens, hasV2LPs, }),
    borrowed: aaveChainTvl(_chain, addressesProviderRegistry, transform, dataHelpers, true, v3, { oracle, abis, hasV2LPs, blacklistedTokens, })
  }
}

module.exports = {
  methodology: methodologies.lendingMarket,
  aaveChainTvl,
  getV2Reserves,
  getTvl,
  aaveExports,
  getBorrowed,
  aaveV2Export,
  aaveV3Export,
}

async function getData({ oracle, chain, block, addressesProviderRegistry, dataHelperAddresses, transformAddressRaw, abis, api, v3 }) {

  if (!api)
    api = new sdk.ChainApi({ chain, block })

  const transformAddress = transformAddressRaw || getChainTransform(chain)
  const fixBalances = getFixBalances(chain)
  const [v2Atokens, v2ReserveTokens, dataHelper, borrowedAmounts,] = await getV2Reserves(api, addressesProviderRegistry, dataHelperAddresses, { abis, v3, })
  let updateBalances

  if (oracle) {
    const params = { chain, block, target: oracle, }
    const [
      baseCurrency, baseCurrencyUnit, prices,
    ] = await Promise.all([
      sdk.api2.abi.call({ ...params, abi: oracleAbis.BASE_CURRENCY, }),
      sdk.api2.abi.call({ ...params, abi: oracleAbis.BASE_CURRENCY_UNIT, }),
      sdk.api2.abi.call({ ...params, abi: oracleAbis.getAssetsPrices, params: [v2ReserveTokens], }),
    ])

    const baseToken = transformAddress(baseCurrency)
    updateBalances = balances => {
      v2ReserveTokens.map(i => `${chain}:${i.toLowerCase()}`).forEach((token, i) => {
        if (!balances[token]) return;
        const balance = balances[token] * prices[i] / baseCurrencyUnit
        delete balances[token]
        sdk.util.sumSingleBalance(balances, baseToken, balance)
      })
      return balances
    }
  }

  return { transformAddress, fixBalances, v2Atokens, v2ReserveTokens, dataHelper, updateBalances, borrowedAmounts, }
}

const oracleAbis = {
  BASE_CURRENCY: "address:BASE_CURRENCY",
  BASE_CURRENCY_UNIT: "uint256:BASE_CURRENCY_UNIT",
  getAssetsPrices: "function getAssetsPrices(address[] assets) view returns (uint256[])",
}

function aaveV2Export(registry, { useOracle = false, baseCurrency, baseCurrencyUnit, abis = {}, fromBlock, blacklistedTokens = [], isAaveV3Fork } = {}) {
  if (isAaveV3Fork && !abis.getReserveData)
    abis.getReserveData = "function getReserveData(address asset) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))"

  async function tvl(api) {
    const data = await getReservesData(api)
    const tokensAndOwners = data.map(i => ([i.underlying, i.aTokenAddress]))
    if (!useOracle)
      return sumTokens2({ tokensAndOwners, api, blacklistedTokens })
    const balances = {}
    const res = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokensAndOwners.map(i => ({ target: i[0], params: i[1] })) })

    res.forEach((v, i) => {
      sdk.util.sumSingleBalance(balances, data[i].currency, v * data[i].price, api.chain)
    })
    return balances
  }

  async function borrowed(api) {
    const balances = api.getBalances()
    const data = await getReservesData(api)
    const supplyVariable = await api.multiCall({
      abi: 'erc20:totalSupply',
      calls: data.map(i => i.variableDebtTokenAddress),
    })
    const supplyStable = await api.multiCall({
      abi: 'erc20:totalSupply',
      calls: data.map(i => i.stableDebtTokenAddress),
    })
    data.forEach((i, idx) => {
      let value = +supplyVariable[idx] + +supplyStable[idx]
      if (useOracle) {
        sdk.util.sumSingleBalance(balances, i.currency, value * i.price, api.chain)
      } else {
        sdk.util.sumSingleBalance(balances, i.underlying, value, api.chain)
      }
    })
    return sumTokens2({ api, balances })
  }

  async function getReservesData(api) {
    if (fromBlock) return getReservesDataFromBlock(api)
    const tokens = await api.call({ abi: abiv2.getReservesList, target: registry })
    const data = await api.multiCall({ abi: abis.getReserveData ?? abiv2.getReserveData, calls: tokens, target: registry, })
    data.forEach((v, i) => v.underlying = tokens[i])
    if (useOracle) {
      let currency = baseCurrency
      let unit = baseCurrencyUnit

      const addressProvider = await api.call({ abi: abiv2.getAddressesProvider, target: registry })
      const oracle = await api.call({ abi: abiv2.getPriceOracle, target: addressProvider })

      if (!currency) currency = await api.call({ abi: abiv2.BASE_CURRENCY, target: oracle })
      if (!unit) unit = await api.call({ abi: abiv2.BASE_CURRENCY_UNIT, target: oracle })

      const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
      // const currencyDecimal = await api.call({ abi: 'erc20:decimals', target: currency })
      const currencyDecimal = 18
      const prices = await api.call({ abi: abiv2.getAssetsPrices, target: oracle, params: [tokens] })
      prices.forEach((v, i) => {
        data[i].price = (v / unit) / (10 ** (decimals[i] - currencyDecimal))
        data[i].currency = currency
      })
    }
    return data
  }

  async function getReservesDataFromBlock(api) {
    const logs = await getLogs({
      api,
      target: registry,
      topics: ['0x3a0ca721fc364424566385a1aa271ed508cc2c0949c2272575fb3013a163a45f'],
      fromBlock,
      eventAbi: 'event ReserveInitialized (address indexed underlying, address indexed aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress)',
      onlyArgs: true,
    })
    return logs
  }

  const abiv2 = {
    getReservesList: "address[]:getReservesList",
    getAddressesProvider: "address:getAddressesProvider",
    BASE_CURRENCY: "address:BASE_CURRENCY",
    BASE_CURRENCY_UNIT: "uint256:BASE_CURRENCY_UNIT",
    getPriceOracle: "address:getPriceOracle",
    getAssetsPrices: "function getAssetsPrices(address[]) view returns (uint256[])",
    getReserveData: "function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))",
  }

  return { tvl, borrowed, }
}


function aaveV3Export(config) {
  const abi = {
    getReserveTokensAddresses: "function getReserveTokensAddresses(address asset) view returns (address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress)",
    getAllReservesTokens: "function getAllReservesTokens() view returns ((string symbol, address tokenAddress)[])",
    getReserveData: "function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasuryScaled, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)",
  };

  const exports = {
    methodology: methodologies.lendingMarket,
  }

  Object.keys(config).forEach(chain => {
    let chainConfig = config[chain]

    let poolDatas
    let abis

    if (typeof chainConfig === 'object') {
      poolDatas = chainConfig.poolDatas
      abis = chainConfig.abis || {}
      Object.entries(abis).forEach(([k, v]) => abi[k] = v)
    }

    if (Array.isArray(chainConfig)) poolDatas = chainConfig

    if (typeof chainConfig === 'string') poolDatas = [chainConfig]

    if (!poolDatas) throw new Error(`No poolDatas for ${chain} in aaveV3Export`)


    const fetchReserveData = async (api, poolDatas, isBorrowed) => {
      const reserveTokens = await api.multiCall({ calls: poolDatas, abi: abi.getAllReservesTokens });
      const calls = []

      poolDatas.map((pool, i) => {
        reserveTokens[i].forEach(({ tokenAddress }) => calls.push({ target: pool, params: tokenAddress }));
      });
      const reserveData = await api.multiCall({ abi: isBorrowed ? abi.getReserveData : abi.getReserveTokensAddresses, calls, })
      let tokensAndOwners = []
      reserveData.forEach((data, i) => {
        const token = calls[i].params
        if (isBorrowed) {
          api.add(token, data.totalVariableDebt)
          api.add(token, data.totalStableDebt)
        } else
          tokensAndOwners.push([token, data.aTokenAddress])
      })

      if (isBorrowed) tokensAndOwners = []  // we still do sumTokens to transform the response
      return sumTokens2({ api, tokensAndOwners })
    }

    exports[chain] = {
      tvl: (api) => fetchReserveData(api, poolDatas),
      borrowed: (api) => fetchReserveData(api, poolDatas, true),
    }
  })


  return exports
}
