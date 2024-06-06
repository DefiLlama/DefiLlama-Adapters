const utils = require('./helper/utils');
const farmDataEndpoint = "https://marketcap.moonfarm.finance/get-farms-data"

async function fetch() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlUSD
}

async function bsc() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlBSC
}

async function polygon() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlPoly
}

async function ethereum() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlETH
}

async function kava() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlKAVA
}
async function avalanche() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlAVAX
}

async function fantom() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlFANTOM
}

async function terra() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlLUNA
}

async function solana() {
  const data = await utils.fetchURL(farmDataEndpoint)
  return data.data.tvlSOLANA
}

module.exports = {
  bsc:{
    fetch:bsc
  },
  polygon:{
    fetch: polygon
  },
  ethereum:{
    fetch: ethereum
  },
  kava:{
    fetch: kava
  },
  avax:{
    fetch: avalanche
  },
  fantom:{
    fetch: fantom
  },
  terra:{
    fetch: terra
  },
  solana:{
    fetch: solana
  },
  fetch
},
module.exports.hallmarks = [
        [1651881600, "UST depeg"],
      ]
