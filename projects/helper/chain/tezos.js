// TzKT transport lives in @defillama/sdk (`sdk.chains.tezos`, `TEZOS_TZKT` overrides the indexer url);
// this file keeps the TVL helpers (token blacklist, address transform, sumTokens, LP resolution).
const ADDRESSES = require('../coreAssets.json')
const sdk = require('@defillama/sdk')
const { PromisePool } = require('@supercharge/promise-pool')

const tezos = sdk.chains.tezos

const RPC_ENDPOINT = tezos.getTzktEndpoint()

const usdtAddressTezos = ADDRESSES.tezos.USDt
const transformAddressDefault = t => t == "tezos" ? "coingecko:tezos" : 'tezos:' + t

const tokenBlacklist = [
  'KT18quSVkqhbJS38d5sbRAEkXd5GoNqmAoro',
  'KT1TtaMcoSx5cZrvaVBWsFoeZ1L15cxo5AEy',
  'KT19oivKN2qzeWgCs886BbttSVYtkcJHRtuQ',
  'KT1AhSVv4Se1j3Hf5Y6a56vBV44zNzjP91D2',
  'KT1Gf5JGXC1M8GMji58pKraXiRLkzW2NRK1s',
  'KT1R52Gk7LzWvyV41oP9dRUbboHs4yVTXAZT',
  'KT1LVnyY5cSCVpFMGXzqVsWNiSkJYA8w1rZk',
  'KT1T9kFJD5fKAT4LAZWjYBCaWNbD7cw1CUju',
  'KT1JXxK3bd39ayLiiBdKm2cdReYnVSG3bkzK',
  'KT1FR9ij18K3dDExgFMBs7ppxfdGYzHiPo7c',
  'KT1GhX6MzTHKcjkMTg1mwCPzam12HRjsp6Sf',
  'KT1C9X9s5rpVJGxwVuHEVBLYEdAQ1Qw8QDjH',
  'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-16',
]

async function getTokenBalances(account, includeTezosBalance = true, { balances = {}, transformAddress = transformAddressDefault } = {}) {
  const response = await tezos.getTokenBalances({ address: account })
  response.forEach((item) => {
    let token = item.contract
    if (item.tokenId !== '0') token += '-' + item.tokenId

    if (!tokenBlacklist.includes(token))
      sdk.util.sumSingleBalance(balances, transformAddress(token), item.balance)
  })

  if (includeTezosBalance)
    sdk.util.sumSingleBalance(balances, transformAddress('tezos'), await getTezosBalance(account))

  return balances
}

// tez balance as a Number (whole tez)
async function getTezosBalance(account) {
  const balance = await tezos.getBalance({ address: account })
  return +balance / 10 ** 6
}

async function getStorage(account) {
  return tezos.getContractStorage({ contract: account })
}

// one page of big map keys -> { key: value } (object keys are indexed by their hash)
async function getBigMapById(id, limit = 1000, offset = 0, key, value) {
  const params = { limit, offset }
  if (key) params.key = key
  if (value) params.value = value
  const response = await tezos.tzkt({ path: `/v1/bigmaps/${id}/keys`, params })
  return tezos.bigMapKeysToObject(response)
}

async function addDexPosition({ balances = {}, account, transformAddress }) {
  return getTokenBalances(account, true, { balances, transformAddress })
}

async function resolveLPPosition({ balances = {}, owner, lpToken, transformAddress = transformAddressDefault, ignoreList = [] }) {
  const LPBalances = await getTokenBalances(owner, false, { transformAddress: i => i })
  if (!LPBalances[lpToken]) return balances
  const data = await getStorage(lpToken)
  const admin = data.admin || data.exchangeAddress
  const total_supply = data.total_supply || data.totalSupply

  if (ignoreList.includes(admin))
    return balances

  const tokenBalances = await getTokenBalances(admin, false, { transformAddress: i => i })
  const ownershipRatio = LPBalances[lpToken] / total_supply
  Object.keys(tokenBalances).forEach(token => {
    const balance = tokenBalances[token] * ownershipRatio
    sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
  })
  return balances
}

async function sumTokens({ owners = [], balances = {}, includeTezos = false }) {
  const { errors } = await PromisePool.withConcurrency(5)
    .for(owners)
    .process(async item => {
      await getTokenBalances(item, includeTezos, { balances })
    })

  if (errors && errors.length)
    throw errors[0]

  return balances
}

async function sumTokens2({ owners = [], balances = {}, includeTezos = false }) {
  return sumTokens({ owners, balances, includeTezos })
}

module.exports = {
  RPC_ENDPOINT,
  usdtAddressTezos,
  sumTokens2,
  getStorage,
  sumTokens,
  getTokenBalances,
  addDexPosition,
  resolveLPPosition,
  getBigMapById,
  getTezosBalance,
}
