const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const abi = require('./abis/aave.json');
const { getChainTransform, getFixBalancesSync, } = require('../helper/portedTokens')

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
        helper.output !== "0x0000000000000000000000000000000000000000"
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

function aaveChainTvl(chain, addressesProviderRegistry, transformAddressRaw, dataHelperAddresses, borrowed, v3 = false, { abis = {}, oracle, } = {}) {
  return async (timestamp, ethBlock, { [chain]: block }) => {
    const balances = {}
    const { transformAddress, fixBalances, v2Atokens, v2ReserveTokens, dataHelper, updateBalances } = await getData({ oracle, chain, block, addressesProviderRegistry, dataHelperAddresses, transformAddressRaw, abis, })
    if (borrowed) {
      await getBorrowed(balances, block, chain, v2ReserveTokens, dataHelper, transformAddress, v3);
    } else {
      await getTvl(balances, block, chain, v2Atokens, v2ReserveTokens, transformAddress);
    }
    if (updateBalances) updateBalances(balances)
    fixBalances(balances)
    return balances
  }
}
function aaveExports(chain, addressesProviderRegistry, transform = undefined, dataHelpers = undefined, { oracle, abis } = {}) {
  return {
    tvl: aaveChainTvl(chain, addressesProviderRegistry, transform, dataHelpers, false, undefined, { oracle, abis, }),
    borrowed: aaveChainTvl(chain, addressesProviderRegistry, transform, dataHelpers, true, undefined, { oracle, abis })
  }
}

module.exports = {
  aaveChainTvl,
  getV2Reserves,
  getTvl,
  aaveExports,
  getBorrowed,
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