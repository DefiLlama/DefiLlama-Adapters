const { sumTokens2, } = require('./helper/unwrapLPs')
const { getLogs } = require('./helper/cache/getLogs')

const config = require("./1inch/config");

module.exports = {}

const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const ETH_PLACEHOLDER = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

function normalizeToken(address) {
  return address.toLowerCase() === ETH_PLACEHOLDER ? WETH : address;
}

Object.keys(config).forEach(chain => {
  const { blacklistedTokens = [], factories } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      for (const { MooniswapFactory, fromBlock} of factories) {
        const logs = await getLogs({
          api,
          target: MooniswapFactory,
          topic: 'Deployed(address,address,address)',
          eventAbi: 'event Deployed(address indexed mooniswap, address indexed token1, address indexed token2)',
          onlyArgs: true,
          fromBlock,
        })

        logs.forEach(({ token1, token2, mooniswap }) => {
          ownerTokens.push([[normalizeToken(token1), normalizeToken(token2)], mooniswap]);
        });
      }
      return sumTokens2({ api, ownerTokens, blacklistedTokens, sumChunkSize: 1000, sumChunkSleep: 2000 })
    }
  }
})