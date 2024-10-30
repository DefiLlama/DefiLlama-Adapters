const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1719734400, "Launched on Merlin Chain"],
    [1718092800, "DeSyn KelpDAO Restaking Fund Launched"],
    [1713340800, "Restaking Fund Series Launched"]
  ],
  methodology: 'Liquid restaking strategy',
}

const config = {
  ethereum: { factory: '0x01a38B39BEddCD6bFEedBA14057E053cBF529cD2', fromBlock: 17335174},
  arbitrum: { factory: '0xdE6b117384452b21F5a643E56952593B88110e78', fromBlock: 175985457}
}

const abi = {
  getBalance: "function getBalance(address) view returns (uint256)"
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
      const calls = []
      const allTokens = []
      let i = 0
      for (const pool of pools) {
        for (const token of tokens[i]) {
          calls.push({ target: pool, params: token })
          allTokens.push(token)
        }
        i++
      }
      const allBals = await api.multiCall({ abi: abi.getBalance, calls })
      api.add(allTokens, allBals)
    }
    
  }
})