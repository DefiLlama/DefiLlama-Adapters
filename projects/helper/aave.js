const { getLogs } = require('./cache/getLogs')
const ADDRESSES = require('./coreAssets.json')
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const abi = require('./abis/aave.json');
const { getChainTransform, getFixBalancesSync, } = require('../helper/portedTokens')
const { sumTokens2 } = require('../helper/unwrapLPs');
const methodologies = require('./methodologies');

async function getV2Reserves(block, addressesProviderRegistry, chain, dataHelperAddress, abis = {}) {
  let validProtocolDataHelpers
  if (dataHelperAddress === undefined) {
    const addressesProviders = (
      await sdk.api.abi.call({
        target: addressesProviderRegistry,
        abi: abi["getAddressesProvidersList"],
        block,
        chain
      })
    ).output;

    const protocolDataHelpers = (
      await sdk.api.abi.multiCall({
        calls: addressesProviders.map((provider) => ({
          target: provider,
          params: "0x0100000000000000000000000000000000000000000000000000000000000000",
        })),
        abi: abi["getAddress"],
        block,
        chain
      })
    ).output;

    validProtocolDataHelpers = protocolDataHelpers.filter(
      (helper) =>
        helper.output !== ADDRESSES.null
    ).map(p => p.output);
  } else {
    validProtocolDataHelpers = dataHelperAddress
  }

  const aTokenMarketData = (
    await sdk.api.abi.multiCall({
      calls: validProtocolDataHelpers.map((dataHelper) => ({
        target: dataHelper,
      })),
      abi: abis.getAllATokens || abi["getAllATokens"],
      block,
      chain
    })
  ).output;

  let aTokenAddresses = [];
  aTokenMarketData.map((aTokensData) => {
    aTokenAddresses = [
      ...aTokenAddresses,
      ...aTokensData.output.map((aToken) => aToken[1]),
    ];
  });

  const underlyingAddressesData = (
    await sdk.api.abi.multiCall({
      calls: aTokenAddresses.map((aToken) => ({
        target: aToken,
      })),
      abi: abi["getUnderlying"],
      block,
      chain
    })
  ).output;

  const reserveAddresses = underlyingAddressesData.map((reserveData) => reserveData.output);

  return [aTokenAddresses, reserveAddresses, validProtocolDataHelpers[0]]
}

async function getTvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddress) {
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

async function getBorrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress, v3 = false) {
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
    const { transformAddress, fixBalances, v2Atokens, v2ReserveTokens, dataHelper, updateBalances } = await getData({ oracle, chain, block, addressesProviderRegistry, dataHelperAddresses, transformAddressRaw, abis, })
    if (borrowed) {
      await getBorrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress, v3);
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
}

const cachedData = {}

async function getData({ oracle, chain, block, addressesProviderRegistry, dataHelperAddresses, transformAddressRaw, abis, }) {
  let dataHelperAddressesStr
  if (dataHelperAddresses && dataHelperAddresses.length) dataHelperAddressesStr = dataHelperAddresses.join(',')
  const key = `${chain}-${block}-${addressesProviderRegistry}-${dataHelperAddresses}-${oracle}`
  if (!cachedData[key]) cachedData[key] = _getData()
  return cachedData[key]

  async function _getData() {
    sdk.log('get aava metadata:', key)

    const transformAddress = transformAddressRaw || await getChainTransform(chain)
    const fixBalances = await getFixBalancesSync(chain)
    const [v2Atokens, v2ReserveTokens, dataHelper] = await getV2Reserves(block, addressesProviderRegistry, chain, dataHelperAddresses, abis)
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

    return { transformAddress, fixBalances, v2Atokens, v2ReserveTokens, dataHelper, updateBalances, }
  }
}

const oracleAbis = {
  BASE_CURRENCY: "address:BASE_CURRENCY",
  BASE_CURRENCY_UNIT: "uint256:BASE_CURRENCY_UNIT",
  getAssetsPrices: "function getAssetsPrices(address[] assets) view returns (uint256[])",
}

function aaveV2Export(registry, { useOracle = false, baseCurrency, baseCurrencyUnit, abis = {}, fromBlock, blacklistedTokens = [] } = {}) {

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
    return balances
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
        data[i].price = (v / unit )/ (10 ** (decimals[i] - currencyDecimal))
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