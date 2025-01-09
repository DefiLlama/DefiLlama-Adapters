
const factory = require('../helper/abis/uniswap.js')
const {getUniTVL} = require('../helper/unknownTokens.js')
const config = {
  optimism: { factory: '0x548118C7E0B865C2CfA94D15EC86B666468ac758'},
  lisk: { factory: '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F'},
  fraxtal: { factory: '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F'},
  //bob: { factory: '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F'},
  mode: { factory: '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F'}
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
