const axios = require('axios')

const axiosObj = axios.create({
  baseURL: 'https://cardano-mainnet.blockfrost.io/api/v0',
  headers: {
    'project_id': 'mai'+'nnetcxT8VaeCgVMzMTSe'+'zZijWlVkyh6XytpS',
    'Content-Type': 'application/json'
  },
  timeout: 300000,
})

async function getAddressesUTXOs(address) {
  const utxos = []
  let page = 1
  let response
  do {
    response = await axiosObj.get(`addresses/${address}/utxos?page=${page}`)
    response = response.data
    utxos.push(...response)
    page++
  } while (response.length)
  return utxos
}

async function getAssets(address) {
  return (await axiosObj.get(`addresses/${address}`)).data.amount
}


async function assetsAddresses(address) {
  const addresses = []
  let page = 1
  let response
  
  do {
    response = await axiosObj.get(`assets/${address}/addresses`, {
      params: { count: 100, page, }
    })
    response = response.data
    addresses.push(...response)
    page++
  } while (response.length)
  return addresses
}

async function addressesUtxosAssetAll(address, asset) {

  const addresses = []
  let page = 1
  let response
  do {
    response = await axiosObj.get(`/addresses/${address}/utxos/${asset}`, {
      params: { count: 100, page, }
    })
    response = response.data
    addresses.push(...response)
    page++
  } while (response.length)
  return addresses
}


async function getTxsRedeemers(utxo) {
  const { data } = await axiosObj.get(`txs/${utxo}/redeemers`)
  return data
}

async function getTxsMetadata(utxo) {
  const { data } = await axiosObj.get(`txs/${utxo}/metadata`)
  return data
}

async function getScriptsDatum(datumHash) {
  const { data } = await axiosObj.get(`scripts/datum/${datumHash}`)
  return data
}

async function getTokensMinted(tokenId){
  const {data} = await axiosObj.get(`assets/${tokenId}`)
  return Number(data.quantity)
}

module.exports = {
  getAssets,
  getAddressesUTXOs,
  getTxsRedeemers,
  getTxsMetadata,
  assetsAddresses,
  addressesUtxosAssetAll,
  getTokensMinted,
  getScriptsDatum,
}
