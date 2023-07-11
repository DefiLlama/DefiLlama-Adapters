const { nullAddress } = require('../helper/unwrapLPs')
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
  /* ethereum: {
    tvl: maticTvl
  }, */
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
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {

      const res = await fetchURL("https://universe.staderlabs.com/common/tvl")
      return {
        "matic-network": res.data.polygon.native,
        [nullAddress]: await api.call({ abi: 'uint256:totalAssets', target: '0xcf5ea1b38380f6af39068375516daf40ed70d299' })
        // [nullAddress]: await api.call({ abi: 'uint256:totalSupply', target: '0xa35b1b31ce002fbf2058d22f30f95d405200a15b' })
      }
    }
  },
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
}

