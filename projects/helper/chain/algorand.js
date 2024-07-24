// documentation: https://developer.algorand.org/docs/get-details/indexer/?from_query=curl#sdk-client-instantiations

const axios = require('axios')
const { getApplicationAddress } = require('./algorandUtils/address')
const { RateLimiter } = require("limiter");
const coreAssets = require('../coreAssets.json')
const ADDRESSES = coreAssets
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const stateCache = {}
const accountCache = {}
const assetCache = {}

const geckoMapping = Object.values(coreAssets.algorand)
const axiosObj = axios.create({
  baseURL: "https://mainnet-idx.algonode.cloud",
  timeout: 300000,
});

const indexerLimiter = new RateLimiter({ tokensPerInterval: 10, interval: "second" });

async function lookupApplications(appId) {
  return (await axiosObj.get(`/v2/applications/${appId}`)).data
}

async function lookupAccountByID(accountId) {
  return (await axiosObj.get(`/v2/accounts/${accountId}`)).data
}

async function searchAccounts({ appId, limit = 1000, nexttoken, searchParams, }) {
  const response = (await axiosObj.get('/v2/accounts', {
    params: {
      ...searchParams,
      'application-id': appId,
      limit,
      next: nexttoken,
    }
  }))
  return response.data
}


async function searchAccountsAll({ appId, limit = 1000, searchParams = {}, sumTokens = false, api }) {
  const accounts = []
  let nexttoken
  do {
    const res = await searchAccounts({ appId, limit, nexttoken, searchParams, })
    nexttoken = res['next-token']
    accounts.push(...res.accounts)
  } while (nexttoken)
  if (sumTokens && api) {
    sdk.log('sumTokens', accounts.length)
    for (const account of accounts) {
      api.add('1', account.amount)
      for (const asset of (account.assets ?? [])) {
        api.add(asset['asset-id']+'', asset.amount)
      }
    }
  }
  return accounts
}

const withLimiter = (fn, tokensToRemove = 1) => async (...args) => {
  await indexerLimiter.removeTokens(tokensToRemove);
  return fn(...args);
}

async function sumTokens({ owner, owners = [], tokens = [], token, balances = {}, blacklistedTokens = [], tinymanLps = [], blacklistOnLpAsWell = false, tokensAndOwners = [], }) {
  if (owner) owners = [owner]
  if (token) tokens = [token]
  if (tokensAndOwners.length) owners = tokensAndOwners.map(i => i[1])
  const accounts = await Promise.all(owners.map(getAccountInfo))
  accounts.forEach(({ assets }, i) => {
    if (tokensAndOwners.length) tokens = [tokensAndOwners[i][0]]
    assets.forEach(i => {
      if (!tokens.length || tokens.includes(i['asset-id']))
        if (!blacklistedTokens.length || !blacklistedTokens.includes(i['asset-id']))
          sdk.util.sumSingleBalance(balances, i['asset-id'], BigNumber(i.amount).toFixed(0), 'algorand')
    })
  })
  if (tinymanLps.length) {
    await Promise.all(tinymanLps.map(([lp, unknown]) => resolveTinymanLp({ balances, lpId: lp, unknownAsset: unknown, blacklistedTokens: blacklistOnLpAsWell ? blacklistedTokens : [] })))
  }
  return balances
}

async function getAssetInfo(assetId) {
  if (!assetCache[assetId]) assetCache[assetId] = _getAssetInfo()
  return assetCache[assetId]

  async function _getAssetInfo() {
    const { data: { asset } } = await axiosObj.get(`/v2/assets/${assetId}`)
    const reserveInfo = await getAccountInfo(asset.params.reserve)
    const assetObj = { ...asset.params, ...asset, reserveInfo, }
    assetObj.circulatingSupply = assetObj.total - reserveInfo.assetMapping[assetId].amount
    assetObj.assets = { ...reserveInfo.assetMapping }
    delete assetObj.assets[assetId]
    return assetObj
  }
}

async function resolveTinymanLp({ balances, lpId, unknownAsset, blacklistedTokens, }) {
  const lpBalance = balances['algorand:' + lpId]
  if (lpBalance && lpBalance !== '0') {
    const lpInfo = await getAssetInfo(lpId)
    let ratio = lpBalance / lpInfo.circulatingSupply
    if (unknownAsset && lpInfo.assets[unknownAsset]) {
      ratio = ratio * 2
      Object.keys(lpInfo.assets).forEach((token) => {
        if (!blacklistedTokens.length || !blacklistedTokens.includes(token))
          if (token !== unknownAsset)
            sdk.util.sumSingleBalance(balances, token, BigNumber(lpInfo.assets[token].amount * ratio).toFixed(0), 'algorand')
      })
    } else {
      Object.keys(lpInfo.assets).forEach((token) => {
        if (!blacklistedTokens.length || !blacklistedTokens.includes(token))
          sdk.util.sumSingleBalance(balances, token, BigNumber(lpInfo.assets[token].amount * ratio).toFixed(0), 'algorand')
      })
    }
  }
  delete balances[lpId]
  delete balances['algorand:' + lpId]
  return balances
}

async function getAccountInfo(accountId) {
  if (typeof accountId === 'number') { // it is an application id
    accountId = getApplicationAddress(accountId)
  }
  if (!accountCache[accountId]) accountCache[accountId] = _getAccountInfo()
  return accountCache[accountId]

  async function _getAccountInfo() {
    const { data: { account } } = await axiosObj.get(`/v2/accounts/${accountId}`)
    if (!account.assets) account.assets = []
    if (account.amount) account.assets.push({ amount: account.amount, 'asset-id': '1', })
    account.assetMapping = {}
    account.assets.forEach(i => {
      i['asset-id'] = '' + i['asset-id']
      account.assetMapping[i['asset-id']] = i
    })
    return account
  }
}

const tokens = {
  usdc: 31566704,
  usdt: 312769,
  wBtc: 1058926737,
  wEth: 887406851,
  wBtcGoBtcLp: 1058934626,
  wEthGoEthLp: 1058935051,
  xUsdGoUsdLp: 1081974597,
  usdtGoUsdLp: 1081978679,
  wusdcGoUsdLp: 1242543501,
  wusdtGoUsdLp: 1242550568,
  goUsd: 672913181,
  usdcGoUsdLp: 885102318,
  gard: 684649988,
  gold$: 246516580,
  silver$: 246519683,
  ASAGold: 1241944285
};

// store all asset ids as string
Object.keys(tokens).forEach(t => tokens[t] = '' + tokens[t])

async function getAppGlobalState(marketId) {
  if (!stateCache[marketId]) stateCache[marketId] = _getAppGlobalState()
  return stateCache[marketId]

  async function _getAppGlobalState() {
    let response = await lookupApplications(marketId);
    let results = {}
    response.application.params["global-state"].forEach(x => {
      let decodedKey = Buffer.from(x.key, "base64").toString("binary")
      results[decodedKey] = x.value.uint
      if (x.value.type === 1) results[decodedKey] = Buffer.from(x.value.bytes, "base64").toString("binary")
    })

    return results
  }
}

async function getPriceFromAlgoFiLP(lpAssetId, unknownAssetId) {
  let lpInfo = await getAssetInfo(lpAssetId)
  if (lpInfo['unit-name'] !== 'AF-POOL') throw new Error('No, this is not an AlgoFi LP')

  const unknownAssetQuantity = lpInfo.reserveInfo.assets.find(i => i['asset-id'] === '' + unknownAssetId).amount
  for (const i of lpInfo.reserveInfo.assets) {
    const id = i['asset-id']
    if (geckoMapping.includes(id)) {
      return {
        price: i.amount / unknownAssetQuantity,
        geckoId: 'algorand:' + id,
        decimals: 0,
      }
    }
  }

  throw new Error('Not mapped with any whitelisted assets')
}

module.exports = {
  tokens,
  getAssetInfo: withLimiter(getAssetInfo),
  searchAccountsAll,
  getAccountInfo,
  sumTokens,
  getApplicationAddress,
  lookupApplications: withLimiter(lookupApplications),
  lookupAccountByID: withLimiter(lookupAccountByID),
  searchAccounts: withLimiter(searchAccounts),
  getAppGlobalState: getAppGlobalState,
  getPriceFromAlgoFiLP,
}