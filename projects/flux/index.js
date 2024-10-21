const sdk = require('@defillama/sdk')

// data taken from https://config.cdn.whoops.world/flux/mainnet.json
const config = {
  bsc: { reportContract: '0x4b2542dEE16CF8Eacf9D5C8F457F0F433FBccAF3' },
  okexchain: { reportContract: '0xfE8d959e0bE8B4e1D53382C691575344abD43F46' },
  polygon: { reportContract: '0x6233CbDf22dAC3f9aa74f7aCb88E9F286782f46B' },
  // heco: { reportContract: '0x9CA69bb48ef2f4DA6a9351BeB50984DB263BF839' },
  arbitrum: { reportContract: '0x6233CbDf22dAC3f9aa74f7aCb88E9F286782f46B' },
  ethereum: { reportContract: '0x02DC57283fB5ebB5442839010013F5771F16078D' },
  conflux: { reportContract: '0x6233CbDf22dAC3f9aa74f7aCb88E9F286782f46B' }
}

const getFluxTVLDetail = 'function getFluxTVLDetail() view returns (uint256 totalSupply, uint256 totalBorrow, uint256 totalStaked)'

module.exports = {
  misrepresentedTokens: true,
  deadFrom: '2022-12-07',
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      const { reportContract } = config[chain]
      const { output: { totalSupply, totalBorrow, } } = await sdk.api.abi.call({
        target: reportContract,
        chain, block,
        abi: getFluxTVLDetail,
      })

      return {
        tether: (totalSupply - totalBorrow) / 1e18
      }
    },
    borrowed:  () => ({}), // bad debt
    
    /*async (_, _b, {[chain]: block}) => {
      const { reportContract } = config[chain]
      const { output: { totalBorrow, } } = await sdk.api.abi.call({
        target: reportContract,
        chain, block,
        abi: getFluxTVLDetail,
      })

      return {
        tether: totalBorrow / 1e18
      }
    },*/
    staking: async (_, _b, {[chain]: block}) => {
      const { reportContract } = config[chain]
      const { output: { totalStaked, } } = await sdk.api.abi.call({
        target: reportContract,
        chain, block,
        abi: getFluxTVLDetail,
      })

      return {
        tether: totalStaked / 1e18
      }
    },
  }
})

