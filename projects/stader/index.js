const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')
const { get } = require("../helper/http")
let _res

async function getData() {
  if (!_res) _res = get("https://universe.staderlabs.com/common/tvl")
  return _res
}

async function hbarTvl(timestamp) {
  const res = await get("https://universe.staderlabs.com/common/tvl")
  return {
    "hedera-hashgraph": res.hedera.native
  }
}

async function maticTvl() {
  const res = await getData()
  return {
    "matic-network": res.polygon.native
  }
}

async function ftmTvl() {
  const res = await getData()
  return {
    "fantom": res.fantom.native
  }
}

async function terra2Tvl() {
  const res = await getData()
  return {
    "terra-luna-2": res.terra.native
  }
}

async function bscTvl() {
  const res = await getData()
  return {
    "binancecoin": res.bnb.native
  }
}

async function nearTvl() {
  const res = await getData()
  return {
    "near": res.near.native
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

      const res = await getData()
      const nodeOperatorRegistry = '0x4f4bfa0861f62309934a5551e0b2541ee82fdcf1'
      const nodeOperatorCount = await api.call({ abi: 'uint256:totalActiveValidatorCount', target: nodeOperatorRegistry })
      const balances = {
        "matic-network": res.polygon.native,
        [nullAddress]: +(await api.call({ abi: 'uint256:totalAssets', target: '0xcf5ea1b38380f6af39068375516daf40ed70d299' })) + +nodeOperatorCount * 4 * 1e18 // 4 ETH per node operator
      }
      return sumTokens2({ api, balances, owner: nodeOperatorRegistry, tokens: [nullAddress] })
    }
  },
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
}

