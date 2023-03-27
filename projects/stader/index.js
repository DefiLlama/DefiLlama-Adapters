const { fetchURL } = require("../helper/utils")

async function hbarTvl(timestamp) {
  const res = await fetchURL("https://universe.staderlabs.com/common/tvl")
  return {
    "hedera-hashgraph": res.data.hedera.native
  }
}

async function maticTvl() {
  const res = await fetchURL("https://universe.staderlabs.com/common/tvl")
  return {
    "matic-network": res.data.polygon.native
  }
}

async function ftmTvl() {
  const res = await fetchURL("https://universe.staderlabs.com/common/tvl")
  return {
    "fantom": res.data.fantom.native
  }
}

async function terra2Tvl() {
  const res = await fetchURL("https://universe.staderlabs.com/common/tvl")
  return {
    "terra-luna-2": res.data.terra.native
  }
}

async function bscTvl() {
  const res = await fetchURL("https://universe.staderlabs.com/common/tvl")
  return {
    "binancecoin": res.data.bnb.native
  }
}

async function nearTvl() {
  const res = await fetchURL("https://universe.staderlabs.com/common/tvl")
  return {
    "near": res.data.near.native
  }
}

module.exports = {
  timetravel: false,
  methodology: 'We aggregated the assets staked across Stader staking protocols',
  /*terra: {
    tvl,
  },*/
  hedera: {
    tvl: hbarTvl,
  },
  // its on ethereum because funds are locked there
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

