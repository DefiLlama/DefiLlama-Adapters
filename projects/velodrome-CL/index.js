
const {getUniTVL} = require('../helper/unknownTokens.js')
const config = {
  optimism: { factory: '0x548118C7E0B865C2CfA94D15EC86B666468ac758'},
}

Object.keys(config).forEach(chain => {
  const { factory } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ factory, fetchBalances: true, abis: {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: "function allPools(uint) view returns (address)",
     } })
  }
})
