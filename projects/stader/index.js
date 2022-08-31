const { fetchURL } = require("../helper/utils")
const { addHBarBalance } = require("../helper/hbar")

//const bscStakeManger = '0x7276241a669489E4BBB76f63d2A43Bfe63080F2F'

async function tvl() {
  const res = await fetchURL("https://staderverse.staderlabs.com/tvl")
  return {
    "terra-luna": res.data.terraClassic.native
    //"terrausd": res.data.totalStakedLunaInUst / 1e6
  }
}

async function hbarTvl(timestamp) {
  return addHBarBalance({ timestamp, address: '0.0.1027588' })
}

async function maticTvl() {
  const res = await fetchURL("https://staderverse.staderlabs.com/tvl")
  return {
    "matic-network": res.data.polygon.native
  }
}

async function ftmTvl() {
  const res = await fetchURL("https://staderverse.staderlabs.com/tvl")
  return {
    "fantom": res.data.fantom.native
  }
}

async function terra2Tvl() {
  const res = await fetchURL("https://staderverse.staderlabs.com/tvl")
  return {
    "terra-luna-2": res.data.terra.native
  }
}

async function bscTvl() {
  const res = await fetchURL("https://staderverse.staderlabs.com/tvl")
  return {
    "binancecoin": res.data.bnb.native
  }
}

async function nearTvl() {
  const res = await fetchURL("https://staderverse.staderlabs.com/tvl")
  return {
    "near": res.data.near.native
  }
}

module.exports = {
  timetravel: false,
  methodology: 'We aggregated the luna staked across Stader stake-pools & liquid token and then converted to UST',
  terra: {
    tvl,
  },
  hedera: {
    tvl: hbarTvl,
  },
  ethereum: {
    tvl: maticTvl
  },
  fantom: {
    tvl: ftmTvl
  },
  terra2: {
    tvl: terra2Tvl
  },
  bsc: {
    tvl: bscTvl
  },
  near: {
    tvl: nearTvl
  },
  hallmarks:[
    [1651881600, "UST depeg"],
  ]
}


