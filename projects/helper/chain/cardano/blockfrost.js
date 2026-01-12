const axios = require('axios')

const defaultBaseUrls = {
  mainnet: 'https://cardano-mainnet.blockfrost.io/api/v0',
  preview: 'https://cardano-preview.blockfrost.io/api/v0',
}

const defaultProjectIds = {
  mainnet: 'mai'+'nnetcxT8VaeCgVMzMTSe'+'zZijWlVkyh6XytpS',
  preview: 'previ' + 'ewUJJvqX2v9T' + 'OOAis8dZWiuyTPfJxJIKgH',
}

const clientCache = new Map()

function getClient(options = {}) {
  const network = (options.network || 'mainnet').toLowerCase()
  const projectId =
    options.projectId ||
    process.env[`BLOCKFROST_PROJECT_ID_${network.toUpperCase()}`] ||
    process.env.BLOCKFROST_PROJECT_ID ||
    defaultProjectIds[network]

  if (!projectId) {
    throw new Error(`Missing Blockfrost project_id for network ${network}`)
  }

  const baseURL =
    options.baseUrl ||
    process.env.BLOCKFROST_BASE_URL ||
    defaultBaseUrls[network] ||
    defaultBaseUrls.mainnet

  const cacheKey = `${network}|${projectId}|${baseURL}`
  if (clientCache.has(cacheKey)) return clientCache.get(cacheKey)

  const instance = axios.create({
    baseURL,
    headers: {
      'project_id': projectId,
      'Content-Type': 'application/json'
    },
    timeout: 300000,
  })

  clientCache.set(cacheKey, instance)
  return instance
}

async function getAddressesUTXOs(address, options) {
  const utxos = []
  let page = 1
  let response
  do {
    response = await getClient(options).get(`addresses/${address}/utxos?page=${page}`)
    response = response.data
    utxos.push(...response)
    page++
  } while (response.length)
  return utxos
}

async function getAssets(address, options) {
  return (await getClient(options).get(`addresses/${address}`)).data.amount
}


async function assetsAddresses(address, options) {
  const addresses = []
  let page = 1
  let response
  
  do {
    response = await getClient(options).get(`assets/${address}/addresses`, {
      params: { count: 100, page, }
    })
    response = response.data
    addresses.push(...response)
    page++
  } while (response.length)
  return addresses
}

async function addressesUtxosAssetAll(address, asset, options) {

  const addresses = []
  let page = 1
  let response
  do {
    response = await getClient(options).get(`/addresses/${address}/utxos/${asset}`, {
      params: { count: 100, page, }
    })
    response = response.data
    addresses.push(...response)
    page++
  } while (response.length)
  return addresses
}

async function getTxUtxos(tx_hash, options) {
  const { data } = await getClient(options).get(`txs/${tx_hash}/utxos`)
  return data
}

async function getTxsRedeemers(utxo, options) {
  const { data } = await getClient(options).get(`txs/${utxo}/redeemers`)
  return data
}

async function getTxsMetadata(utxo, options) {
  const { data } = await getClient(options).get(`txs/${utxo}/metadata`)
  return data
}

async function getScriptsDatum(datumHash, options) {
  const { data } = await getClient(options).get(`scripts/datum/${datumHash}`)
  return data
}

async function getTokensMinted(tokenId, options){
  const {data} = await getClient(options).get(`assets/${tokenId}`)
  return Number(data.quantity)
}

async function getAccountAddresses(account, options) {
  const { data } = await getClient(options).get(`/accounts/${account}/addresses`)
  return data
}

module.exports = {
  getAssets,
  getAddressesUTXOs,
  getTxUtxos,
  getTxsRedeemers,
  getTxsMetadata,
  assetsAddresses,
  addressesUtxosAssetAll,
  getTokensMinted,
  getScriptsDatum,
  getAccountAddresses
}
