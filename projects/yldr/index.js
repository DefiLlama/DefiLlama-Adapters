const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require('../helper/cache/getLogs')

module.exports = {
  methodology: 'Get available liquidity for all reserves and include Uniswap V3 positions',
  start: 1702931986,
};

const config = {
  ethereum: { v3Wrapper: '0x13f4dc963ddd2ec0160f6473c69b704b0e8674fc', factory: '0xd7b1C5afc105e0E70F78B66CdFE977aEf80540bA', fromBlock: 18808612, },
  arbitrum: { v3Wrapper: '0x07B99965dBEdf38322ADFe48623e042Aa0656283', factory: '0x88959bebbce33d75227633d5114e3c3fd0fb9a6d', fromBlock: 155897900, },
  polygon: { v3Wrapper: '0x27b3E5fD3E2C03Ac02Ee2a90E7B0C52Dac179dAe', factory: '0xf336D4687937C109e51e0266663689Da5ad637C3', fromBlock: 54456800 },
}

const eventAbi = 'event ReserveInitialized (address indexed asset, address indexed yToken, address variableDebtToken, address interestRateStrategyAddress)'

const getLogsCache = {}

Object.keys(config).forEach(chain => {
  const { v3Wrapper, factory, fromBlock, } = config[chain]
  function _getLogs(api) {
    const block = api.block ?? 'unknown'
    const key = `${chain}:${block}`
    if (!getLogsCache[key]) getLogsCache[key] = getLogs({ api, target: factory, eventAbi, onlyArgs: true, fromBlock, })
    return getLogsCache[key]
  }

  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await _getLogs(api)
      const tokensAndOwners = logs.map(log => [log.asset, log.yToken])
      await api.sumTokens({ tokensAndOwners })
      return sumTokens2({ api, owner: v3Wrapper, resolveUniV3: true, })
    },
    borrowed: async (api) => {
      const logs = await _getLogs(api)
      const tokens = logs.map(log => log.asset)
      const bals = await api.multiCall({ abi: 'erc20:totalSupply', calls: logs.map(log => log.variableDebtToken) })
      api.addTokens(tokens, bals)
      return api.getBalances()
    },
  }
})
