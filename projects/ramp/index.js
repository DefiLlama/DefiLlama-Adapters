const abi = require('./abi.json');
const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

function getChainTVL(chain) {
  return async (api) => {
    const key = chain === 'ethereum' ? 'eth' : chain;
    const { [key]: config } = await getConfig('ramp', 'https://config.rampdefi.com/config/appv2/priceInfo');
    const tokens = config.tokens;
    delete tokens.RUSD
    delete tokens.RAMP
    const calls = []
    const iTokens = []

    for (const [tokenName, token] of Object.entries(tokens)) {
      if (token?.strategy?.type === undefined) continue
      const tokenAddress = token.address;
      iTokens.push(tokenAddress)
      calls.push({ target: token.strategy.address, params: tokenAddress })
    }

    const res = (await api.multiCall({ abi: abi.getPoolAmount, calls, permitFailure: true})).map(i => i ?? 0)
    api.addTokens(iTokens, res)
    return sumTokens2({ api, resolveLP: true, })
  }
}

const chains = ['ethereum', 'bsc', 'polygon', 'avax',]
module.exports = {
  hallmarks: [
    [1661439572, "Remove native assets from tvl"]
  ],
}

chains.forEach(chain => {
  module.exports[chain] = { tvl: getChainTVL(chain) }
})
