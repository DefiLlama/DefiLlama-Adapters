const http = require('./http')
const sdk = require('@defillama/sdk')
const { getChainTransform } = require('./portedTokens')
const { default: BigNumber } = require('bignumber.js')

const RPC_ENDPOINT = 'https://api.tzkt.io'

async function getTokenBalances(account) {
  const response = await http.get(`${RPC_ENDPOINT}/v1/tokens/balances?account=${account}&sort.desc=balance&offset=0&limit=40&select=balance,token.id%20as%20id,token.contract%20as%20contract,token.tokenId%20as%20token_id`)
  const balances = response.reduce((agg, item) => {
    let token = item.contract.address
    if (item.token_id !== '0') token += '-' + item.token_id
    agg[token] = item.balance
    return agg
  }, {})

  balances['tezos'] = await getTezosBalance(account)
  if (balances.tezos === 0)  delete balances.tezos
  return balances
}

async function getTezosBalance(account) {
  const balance = await http.get(`${RPC_ENDPOINT}/v1/accounts/${account}/balance`)
  return +balance / 10 ** 6
}

async function getStorage(account) {
  return http.get(`${RPC_ENDPOINT}/v1/contracts/${account}/storage`)
}

async function addDexPosition({ balances = {}, account, transformAddress }) {
  if (!transformAddress) transformAddress = await getChainTransform('tezos')
  const tokenBalances = await getTokenBalances(account)
  Object.keys(tokenBalances).forEach(token => sdk.util.sumSingleBalance(balances, transformAddress(token), tokenBalances[token]))
  return balances
}

async function resolveLPPosition({ balances = {}, owner, lpToken, transformAddress, ignoreList = [] }) {
  if (!transformAddress) transformAddress = await getChainTransform('tezos')
  const LPBalances = await getTokenBalances(owner)
  if (!LPBalances[lpToken]) return balances
  const data = await getStorage(lpToken)
  const admin = data.admin || data.exchangeAddress
  const total_supply = data.total_supply || data.totalSupply
  
  if (ignoreList.includes(admin))
    return balances
  
  const tokenBalances = await getTokenBalances(admin)
  const ownershipRatio = BigNumber(LPBalances[lpToken]).dividedBy(total_supply)
  Object.keys(tokenBalances).forEach(token => {
    const balance = BigNumber(tokenBalances[token]).multipliedBy(ownershipRatio).toFixed(0)
    sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
  })
  return balances
}

module.exports = {
  RPC_ENDPOINT,
  getTokenBalances,
  addDexPosition,
  resolveLPPosition,
}
