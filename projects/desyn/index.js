const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  doublecounted: true,
  methodology: 'TVL: RWA STBT, issued by Matrixdock (part of Matrixport), is an investment portfolio that focuses on US short-term treasury bond digital assets and operates in a fully decentralized manner.',
}

const config = {
  ethereum: { factory: '0x01a38B39BEddCD6bFEedBA14057E053cBF529cD2', fromBlock: 17335174},
  arbitrum: { factory: '0xdE6b117384452b21F5a643E56952593B88110e78', fromBlock: 175985457},
  //merlin chain is tracked under a new listing for farm
}

Object.keys(config).forEach(chain => {
  const {factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event LOG_NEW_POOL (address indexed caller, address indexed pool)',
        onlyArgs: true,
        fromBlock,
      })
      const pools = logs.map(i=>i.pool)
      const tokens = await api.multiCall({  abi: 'address[]:getCurrentTokens', calls: pools})
      return api.sumTokens({ ownerTokens: tokens.map((tokens, i) => [tokens, pools[i]])})
    }
  }
})