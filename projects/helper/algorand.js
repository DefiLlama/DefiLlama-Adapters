// documentation: https://developer.algorand.org/docs/get-details/indexer/?from_query=curl#sdk-client-instantiations

const axios = require('axios')
const { getApplicationAddress } = require('./algorandUtils/address')
const { RateLimiter } = require("limiter");
const { fixBalancesTokens } = require('../helper/tokenMapping')
const { getFixBalancesSync } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');


const axiosObj = axios.create({
  baseURL: 'https://algoindexer.algoexplorerapi.io',
  timeout: 300000,
})

const indexerLimiter = new RateLimiter({ tokensPerInterval: 10, interval: "second" });

async function lookupApplications(appId) {
  return (await axiosObj.get(`/v2/applications/${appId}`)).data
}

async function lookupAccountByID(appId) {
  return (await axiosObj.get(`/v2/accounts/${appId}`)).data
}

async function searchAccounts({ appId, limit = 1000, nexttoken, }) {
  const response = (await axiosObj.get('/v2/accounts', {
    params: {
      'application-id': appId,
      limit,
      next: nexttoken
    }
  }))
  return response.data
}

const withLimiter = (fn, tokensToRemove = 1) => async (...args) => {
  await indexerLimiter.removeTokens(tokensToRemove);
  return fn(...args);
}

async function sumTokens({ owner, owners = [], tokens = [], token, balances = {}, blacklistedTokens = [], tinymanLps = [], }) {
  if (owner) owners = [owner]
  if (token) tokens = [token]
  const accounts = await Promise.all(owners.map(getAccountInfo))
  accounts.forEach(({ assets }) => {
    assets.forEach(i => {
      if (!tokens.length || tokens.includes(i['asset-id']))
        if (!blacklistedTokens.length || !blacklistedTokens.includes(i['asset-id']))
          sdk.util.sumSingleBalance(balances, i['asset-id'], BigNumber(i.amount).toFixed(0))
    })
  })
  if (tinymanLps.length) {
    await Promise.all(tinymanLps.map(([lp, unknown]) => resolveTinymanLp(balances, lp, unknown)))
  }
  const fixBalances = getFixBalancesSync('algorand')
  return fixBalances(balances)
}

async function getAssetInfo(assetId, { includeReserveInfo = false } = {}) {
  const { data: { asset } } = await axiosObj.get(`/v2/assets/${assetId}`)
  const assetObj = { ...asset.params, ...asset, }
  if (includeReserveInfo) {
    const reserveInfo = await getAccountInfo(asset.params.reserve)
    assetObj.reserveInfo = reserveInfo
    assetObj.circulatingSupply = assetObj.total - reserveInfo.assetMapping[assetId].amount
    assetObj.assets = { ...reserveInfo.assetMapping }
    delete assetObj.assets[assetId]
  }
  return assetObj
}

async function resolveTinymanLp(balances, lpId, unknownAsset) {
  const lpBalance = balances[lpId]
  if (lpBalance && lpBalance !== '0') {
    const lpInfo = await getAssetInfo(lpId, { includeReserveInfo: true })
    let ratio = lpBalance / lpInfo.circulatingSupply
    if (unknownAsset && lpInfo.assets[unknownAsset]) {
      ratio = ratio * 2
      Object.keys(lpInfo.assets).forEach((token) => {
        if (token !== unknownAsset)
          sdk.util.sumSingleBalance(balances, token, BigNumber(lpInfo.assets[token].amount * ratio).toFixed(0))
      })
    } else {
      Object.keys(lpInfo.assets).forEach((token) => {
        sdk.util.sumSingleBalance(balances, token, BigNumber(lpInfo.assets[token].amount * ratio).toFixed(0))
      })
    }
  }
  delete balances[lpId]
  return balances
}

async function getAccountInfo(accountId) {
  const { data: { account } } = await axiosObj.get(`/v2/accounts/${accountId}`)
  account.assetMapping = {}
  account.assets.forEach(i => {
    i['asset-id'] = '' + i['asset-id']
    account.assetMapping[i['asset-id']] = i
  })
  return account
}

const tokens = {
  usdc: 31566704,
  goUsd: 672913181,
  usdcGoUsdLp: 885102318,
}

// store all asset ids as string
Object.keys(tokens).forEach(t => tokens[t] = '' + tokens[t])

module.exports = {
  tokens,
  getAssetInfo,
  getAccountInfo,
  sumTokens,
  getApplicationAddress,
  lookupApplications: withLimiter(lookupApplications),
  lookupAccountByID: withLimiter(lookupAccountByID),
  searchAccounts: withLimiter(searchAccounts),
}
