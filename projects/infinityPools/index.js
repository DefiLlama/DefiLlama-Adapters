const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  base: { factory: '0x86342D7bBe93cB640A6c57d4781f04d93a695f08', fromBlock: 24888600, peripheryVault: '0xF8FAD01B2902fF57460552C920233682c7c011a7' }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, peripheryVault } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, fromBlock, eventAbi: 'event PoolCreated (address indexed token0, address indexed token1, int256 splits, address pool, uint8 decimals0, uint8 decimals1)' })
      const ownerTokens = []

      for (let { token0, token1, pool } of logs) {
        ownerTokens.push([[token0, token1], pool])
        ownerTokens.push([[token0, token1], peripheryVault])
      }

      return sumTokens2({ api, ownerTokens })
    }
  }
})