// documentation: https://developer.algorand.org/docs/get-details/indexer/?from_query=curl#sdk-client-instantiations
//
// Indexer transport (rate limited, uint64 safe json parsing) and the address codec live in @defillama/sdk
// (`sdk.chains.algorand`); this file keeps the TVL helpers (sumTokens, tinyman / algofi LP resolution, token ids).

const coreAssets = require('../coreAssets.json')
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const algorand = sdk.chains.algorand
const { getApplicationAddress } = algorand
const stateCache = {}
const assetCache = {}

const geckoMapping = Object.values(coreAssets.algorand)

// indexer responses keep the historical `{ application }` / `{ account }` wrapper shapes
async function lookupApplications(appId) {
  const application = await algorand.lookupApplication({ appId })
  return { application }
}

async function lookupAccountByID(accountId) {
  const account = await algorand.lookupAccount({ address: accountId })
  if (!account) throw new Error(`algorand: account not found ${accountId}`)
  return { account }
}

async function searchAccounts({ appId, limit = 1000, nexttoken, searchParams, }) {
  return algorand.searchAccounts({ appId, limit, nextToken: nexttoken, params: searchParams })
}

async function lookupApplicationsCreatedByAccount(accountId) {
  return algorand.lookupApplicationsCreatedByAccount({ address: accountId })
}

async function searchAccountsAll({ appId, limit = 1000, searchParams = {}, sumTokens = false, api }) {
  const accounts = await algorand.searchAccountsAll({ appId, limit, params: searchParams })
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

async function sumTokens({ owner, owners = [], tokens = [], token, balances, api, blacklistedTokens = [], tinymanLps = [], blacklistOnLpAsWell = false, tokensAndOwners = [], }) {
  if (!balances) {
    balances = api ? api.getBalances() : {}
  }
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
    const asset = await algorand.getAssetInfo({ assetId })
    const reserveInfo = await getAccountInfo(asset.reserve)
    const assetObj = { ...asset, reserveInfo, }
    assetObj.circulatingSupply = assetObj.total - reserveInfo.assetMapping[assetId].amount
    assetObj.assets = { ...reserveInfo.assetMapping }
    delete assetObj.assets[assetId]
    return assetObj
  }
}

async function getAssetInfoWithoutReserve(assetId) {
  if (!assetCache[assetId]) assetCache[assetId] = algorand.getAssetInfo({ assetId })
  return assetCache[assetId]
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

// account with `assets` (asset ids as strings, ALGO under the pseudo id '1') and `assetMapping`; numeric ids are application ids
async function getAccountInfo(accountId) {
  return algorand.getAccountInfo({ address: accountId })
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

// global state keyed by the latin1 decoded key; uints as numbers, bytes latin1 decoded (historical shape)
async function getAppGlobalState(marketId) {
  if (!stateCache[marketId]) stateCache[marketId] = _getAppGlobalState()
  return stateCache[marketId]

  async function _getAppGlobalState() {
    let response = await lookupApplications(marketId);
    let results = {}
    response.application.params["global-state"].forEach(x => {
      let decodedKey = Buffer.from(x.key, "base64").toString("binary")
      results[decodedKey] = typeof x.value.uint === 'string' ? Number(x.value.uint) : x.value.uint
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

async function lookupTransactionsByID(searchParams = {}) {
  return algorand.lookupTransactions({ params: searchParams })
}

async function getApplicationBoxes({ appId, limit = 1000, nexttoken, }) {
  const res = await algorand.getApplicationBoxes({ appId, limit, nextToken: nexttoken })
  return res.boxes
}

module.exports = {
  tokens,
  getAssetInfo,
  getAssetInfoWithoutReserve,
  searchAccountsAll,
  getAccountInfo,
  sumTokens,
  getApplicationAddress,
  lookupApplications,
  lookupAccountByID,
  lookupTransactionsByID,
  searchAccounts,
  getAppGlobalState,
  getPriceFromAlgoFiLP,
  lookupApplicationsCreatedByAccount,
  getApplicationBoxes,
}
