const { getLogs2 } = require('../helper/cache/getLogs')
const { nullAddress } = require('../helper/tokenMapping')

const config = {
  arbitrum: { factory: '0xfCd5dA8c2682e5d17235A5010A01bf6B51B2841D', fromBlock: 186066057 },
}

module.exports = {
  methodology:
    "Ponzi Market's TVL equals to the sum of all ETH balances of all game contracts",
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi: "event CreateGame(address contractAddress, uint256 id, uint256 initialDeposit, address creator, uint256 fee, string name, uint256 roi, uint256 maxDeposit, uint256 minDeposit, string file)", fromBlock, })
      const pools = logs.map(log => log.contractAddress)
      return api.sumTokens({ owners: pools, tokens: [nullAddress]})
    }
  }
})