const { sumTokens2 } = require("../helper/unwrapLPs")
const abi = {
  "getPool": "function allPools(uint256) view returns (address)",
  "getAllPools": "address[]:getAllPools",
  "getTokens": "address[]:getTokens"
};
const { staking } = require('../helper/staking')

const chainConfig = {
  ethereum: { factory: '0x1771dff85160768255F0a44D20965665806cBf48', },
  kcc: { factory: '0x945316F2964ef5C6C84921b435a528DD1790E93a', },
  polygon: { factory: '0x23c1b313152e276e0CF61665dc3AC160b3c5aB19', },
  shiden: { factory: '0x7449314B698f918E98c76279B5570613b243eECf', },
  avax: { factory: '0xaD6b9b31832A88Bb59dB4ACD820F8df2CfA84f0f', },
  astar: { factory: '0xb4BcA5955F26d2fA6B57842655d7aCf2380Ac854', },
  aurora: { factory: '0x979e5d41595263f6Dfec4F4D48419C555B80D95c', },
}

const eswToken = "0x5a75a093747b72a0e14056352751edf03518031d";
const stakingPool = "0xe094E3E16e813a40E2d6cC4b89bfeAe0142044e1";


module.exports = {
  methodology: "ETH and KCC TVL are the total liquidity from the LPs according to the subgraph. Staking TVL would be ESW value in the staking pool.",
};

Object.keys(chainConfig).forEach(chain => {
  const { factory } = chainConfig[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const pools = await api.call({ target: factory, abi: abi.getAllPools, })
      const tokens = await api.multiCall({ calls: pools, abi: abi.getTokens, })
      return sumTokens2({ api, ownerTokens: pools.map((v, i) => [tokens[i], v]) })
    }
  }
})
module.exports.ethereum.staking = staking(stakingPool, eswToken)