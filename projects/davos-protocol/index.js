const { get } = require("../helper/http")

const ADDRESSES = require('../helper/coreAssets.json')
let aux

async function getARBTvl() {
  aux = await get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=42161')
  return (aux.amount.toFixed(0))
}

async function getBSCTvl() {
  aux = await get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=56')
  return (aux.amount.toFixed(0))
}

async function getETHTvl() {
  aux = await get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=1')
  return (aux.amount.toFixed(0))
}

async function getOpimismTvl() {
  aux = await get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=10')
  return (aux.amount.toFixed(0))
}

async function getPolygonPOSTvl() {
  aux = await get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=137')
  return (aux.amount.toFixed(0))
}

async function getPolygonZkEVMTvl() {
  aux = await get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=1101')
  return (aux.amount.toFixed(0))
}

async function getModeTvl() {
  aux = await get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=34443')
  return (aux.amount.toFixed(0))
}

async function getLineaTvl() {
  aux = await get('https://api.prod.davos.xyz/cmc/total-tvl?blockchain=59144')
  return (aux.amount.toFixed(0))
}

module.exports = {
  methodology: 'collateral TVL * collateral price', 
  arbitrum: {
    tvl: getARBTvl,
  },
  bsc: {
    tvl: getBSCTvl,
  },
  ethereum: {
    tvl: getETHTvl,
  },
  optimism: {
    tvl: getOpimismTvl,
  },
  polygon: {
    tvl: getPolygonPOSTvl,
  },
  polygon_zkevm: {
    tvl: getPolygonZkEVMTvl,
  },
  mode: {
    tvl: getModeTvl,
  },
  linea: {
    tvl: getLineaTvl,
  },
}
