
const { getUniTVL } = require('../helper/unknownTokens.js')
const config = {
  optimism: { factory: '0xCc0bDDB707055e04e497aB22a59c2aF4391cd12F' },
  lisk: { },
  fraxtal: { },
  //bob: {},
  mode: { },
  ink: { },
  soneium: { },
  unichain: { },
  swellchain: { },
  celo: { },
}

Object.keys(config).forEach(chain => {
  const { factory = '0x04625B046C69577EfC40e6c0Bb83CDBAfab5a55F' } = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({
      factory, fetchBalances: true, abis: {
        allPairsLength: 'uint256:allPoolsLength',
        allPairs: "function allPools(uint) view returns (address)",
      }
    })
  }
})
