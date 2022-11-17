const axios = require('axios')
const { default: BigNumber } = require("bignumber.js")
const sdk = require('@defillama/sdk')
const { transformBalances } = require('../portedTokens')

// https://cosmos-chain.directory/chains/cosmoshub
// https://cosmos-chain.directory/chains
const endPoints = {
  crescent: 'https://mainnet.crescent.network:1317',
  osmosis: 'https://lcd.osmosis.zone',
  cosmos: 'https://cosmoshub-lcd.stakely.io',
}

const chainSubpaths = {
  crescent: 'crescent',
}

function getEndpoint(chain) {
  if (!endPoints[chain])
    throw new Error('Chain not found')
  return endPoints[chain]
}

async function query(url, block, chain) {
  block = undefined
  let endpoint = `${getEndpoint(chain)}/wasm/${url}`
  if (block !== undefined) {
    endpoint += `&height=${block - (block % 100)}`
  }
  return (await axios.get(endpoint)).data.result
}

async function queryV1Beta1({ chain, paginationKey, block, url } = {}) {
  const subpath = chainSubpaths[chain] || 'cosmos'
  let endpoint = `${getEndpoint(chain)}/${subpath}/${url}`
  if (block !== undefined) {
    endpoint += `?height=${block - (block % 100)}`
  }
  if (paginationKey) {
    const paginationQueryParam = `pagination.key=${paginationKey}`
    if (block === undefined) {
      endpoint += "?"
    } else {
      endpoint += "&"
    }
    endpoint += paginationQueryParam
  }
  return (await axios.get(endpoint)).data
}

async function getBalance({ token, owner, block, chain } = {}) {
  const data = await query(`contracts/${token}/store?query_msg={"balance":{"address":"${owner}"}}`, block, chain)
  return Number(data.balance)
}

async function getDenomBalance({ denom, owner, block, chain } = {}) {
  let endpoint = `${getEndpoint(chain)}/bank/balances/${owner}`
  if (block !== undefined) {
    endpoint += `?height=${block - (block % 100)}`
  }
  const data = (await axios.get(endpoint)).data.result

  const balance = data.find(balance => balance.denom === denom);
  return balance ? Number(balance.amount) : 0
}

async function getBalance2({ balances = {}, owner, block, chain } = {}) {
  const subpath = chainSubpaths[chain] || 'cosmos'
  let endpoint = `${getEndpoint(chain)}/${subpath}/bank/v1beta1/balances/${owner}?pagination.limit=1000`
  if (block) {
    endpoint += `?height=${block - (block % 100)}`
  }
  const data = (await axios.get(endpoint)).data.balances
  for (const {denom, amount} of data)
    sdk.util.sumSingleBalance(balances,denom,amount)
  return balances
}

// LP stuff
async function totalSupply({ token, block, chain } = {}) {
  const data = await query(`contracts/${token}/store?query_msg={"token_info":{}}`, block, chain)
  return data.total_supply
}

async function lpMinter({ token, block, chain } = {}) {
  const data = await query(`contracts/${token}/store?query_msg={"minter":{}}`, block, chain)
  return data.minter
}

async function queryContract({ contract, chain, data }) {
  if (typeof data !== 'string') data = JSON.stringify(data)
  data = Buffer.from(data).toString('base64')
  return (await axios.get(`${getEndpoint(chain)}/cosmwasm/wasm/v1/contract/${contract}/smart/${data}`)).data.data
}

function getAssetInfo(asset) {
  return [asset.info.native_token?.denom ?? asset.info.token?.contract_addr, Number(asset.amount)]
}

async function unwrapLp({ balances, lpBalance, lpToken, block, chain } = {}) {
  const pair = await lpMinter({ token: lpToken, chain, block, })
  const { assets, total_share } = await query(`contracts/${pair}/store?query_msg={"pool":{}}`, block);
  const [token0, amount0] = getAssetInfo(assets[0])
  const [token1, amount1] = getAssetInfo(assets[1])
  balances[token0] = (balances[token0] ?? 0) + (amount0 * lpBalance / total_share)
  balances[token1] = (balances[token1] ?? 0) + (amount1 * lpBalance / total_share)
}

async function queryContractStore({ contract, queryParam, block, chain = false, }) {
  if (typeof queryParam !== 'string') queryParam = JSON.stringify(queryParam)
  const url = `contracts/${contract}/store?query_msg=${queryParam}`
  return query(url, block, chain)
}

function sumSingleBalance(balances, token, balance, price) {
  const { coingeckoId, label, decimals = 0, } = tokenMapping[token] || {}

  if (coingeckoId || (label && price)) {
    token = coingeckoId || 'terrausd'

    if (decimals)
      balance = BigNumber(balance).shiftedBy(-1 * decimals)

    if (!coingeckoId)
      balance = balance.multipliedBy(BigNumber(price))   // convert the value to UST

    if (!balances[token])
      balances[token] = BigNumber(0)
    else if (typeof balances[token] === 'string')
      balances[token] = BigNumber(balances[token]).shiftedBy(-1 * decimals)

    balances[token] = balances[token].plus(balance)
    return
  }

  sdk.util.sumSingleBalance(balances, token, balance)
  return balances
}

async function sumTokens({balances = {}, owners = [], chain, }) {
  await Promise.all(owners.map(i => getBalance2({ balances, owner: i, chain, })))
  return transformBalances(chain, balances)
}

module.exports = {
  totalSupply,
  getBalance,
  getDenomBalance,
  unwrapLp,
  query,
  queryV1Beta1,
  queryContractStore,
  sumSingleBalance,
  queryContract,
  sumTokens,
}
