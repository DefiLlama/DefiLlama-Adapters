const { sumTokens2 } = require('./unwrapLPs')
const { getLogs } = require('./cache/getLogs')

const swapStorageABI = "function swapStorage() view returns (uint256 initialA, uint256 futureA, uint256 initialATime, uint256 futureATime, uint256 swapFee, uint256 adminFee, address lpToken, address feeCollector)"
function saddleExports(config) {
  const exports = {}

  Object.keys(config).forEach(chain => {
    const { factory, fromBlock } = config[chain]
    exports[chain] = {
      tvl: async (api) => {
        const logs = await getLogs({
          api,
          target: factory,
          topics: ['0x0838512b7934222cec571cf3fde1cf3e9e864bbc431bd5d1ef4d9ed3079093d9'],
          fromBlock,
          eventAbi: 'event NewSwapPool (address indexed deployer, address swapAddress, address[] pooledTokens)',
          onlyArgs: true,
        })

        const blacklistedTokens = (await api.multiCall({  abi: swapStorageABI, calls: logs.map(i => i.swapAddress)})).map(i => i.lpToken)
        return sumTokens2({ api, ownerTokens: logs.map(i => [i.pooledTokens, i.swapAddress]), blacklistedTokens, })
      }
    }
  })


  return exports
}

module.exports = {
  saddleExports,
};
