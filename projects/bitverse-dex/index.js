const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

const config = {
  pharos: {
    fromBlock: 3832350,
    uniswapV4Factory: '0xD681e96AD464f8F7F7fa7e1E0c5a367175E44550',
  }
}

const uniswapV4InitializeEvent = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'

Object.keys(config).forEach(chain => {
  const { fromBlock, uniswapV4Factory, blacklistedTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory: uniswapV4Factory, eventAbi: uniswapV4InitializeEvent, fromBlock })
      const tokenSet = new Set()
      const ownerTokens = []
      const hookOwnerTokenSet = new Set()

      logs.forEach(({ currency0, currency1, hooks }) => {
        tokenSet.add(currency0)
        tokenSet.add(currency1)

        if (hooks !== nullAddress) {
          addHookOwnerToken(currency0, hooks)
          addHookOwnerToken(currency1, hooks)
        }
      })

      ownerTokens.push([Array.from(tokenSet), uniswapV4Factory])

      return sumTokens2({
        api,
        ownerTokens,
        permitFailure: true,
        blacklistedTokens,
        sumChunkSize: 10000,
        sumChunkSleep: 5000,
      })

      function addHookOwnerToken(token, owner) {
        const key = `${owner.toLowerCase()}:${token.toLowerCase()}`
        if (hookOwnerTokenSet.has(key)) return
        hookOwnerTokenSet.add(key)
        ownerTokens.push([token, owner])
      }
    }
  }
})
