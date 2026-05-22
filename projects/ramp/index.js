const abi = {
    "getPoolBalance": "function getPoolBalance(address _token) view returns (uint256)",
    "getPoolAmount": "function getPoolAmount(address _token) view returns (uint256)"
  };
const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

function getChainTVL(chain) {
  return async (api) => {
    // https://appv2.rampdefi.com/#/lever
    return {}
/*     const key = chain === 'ethereum' ? 'eth' : chain;
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
    return sumTokens2({ api, resolveLP: true, }) */
  }
}

const chains = ['ethereum', 'bsc', 'polygon', 'avax',]
module.exports = {
  hallmarks: [
    ['2022-08-25', "Remove native assets from tvl"]
  ],
}

chains.forEach(chain => {
  module.exports[chain] = { tvl: getChainTVL(chain) }
})
