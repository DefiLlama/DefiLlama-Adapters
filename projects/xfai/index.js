const ADDRESSES = require('../helper/coreAssets.json')
const FACTORY_ADDRESS = "0xa5136eAd459F0E61C99Cec70fe8F5C24cF3ecA26";

module.exports = {
  methodology: `Sums on-chain tvl by getting pools using xfai factory`,
  start: '2023-08-18' , // Aug-18-2023 08:39:25 AM +UTC
  linea: {
    tvl: async (api) => {
      const pools = await api.fetchList({  lengthAbi: "uint256:allPoolsLength", itemAbi: "function allPools(uint256) external view returns (address)", target: FACTORY_ADDRESS})
      const tokens = await api.multiCall({  abi: 'address:poolToken', calls: pools})
      const ownerTokens = pools.map((v, i) => [[tokens[i], ADDRESSES.linea.WETH], v])
      return api.sumTokens({ ownerTokens})
    },
  },
};
