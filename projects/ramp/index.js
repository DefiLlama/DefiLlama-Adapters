const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const axios = require("axios");
const { getChainTransform, getFixBalances } = require('../helper/portedTokens')

async function getConfig(network) {
  return await axios.get('https://config.rampdefi.com/config/appv2/priceInfo').then(response => response.data[network]);
}

function getChainTVL(chain) {
  return async (timestamp, ethBlock, { [chain]: block }) => {
    let balances = {};
    const config = await getConfig(chain === 'ethereum' ? 'eth' : chain);
    const tokens = config.tokens;
    delete tokens.RUSD
    delete tokens.RAMP
    const transform = await getChainTransform(chain)
    const fixBalances = await getFixBalances(chain)

    const calls = []

    for (const [tokenName, token] of Object.entries(tokens)) {
      if (token?.strategy?.type === undefined) continue
      const tokenAddress = token.address;
      calls.push({ target: token.strategy.address, params: tokenAddress })
    }

    const { output: res } = await sdk.api.abi.multiCall({
      abi: abi.getPoolAmount,
      calls,
      chain, block,
    })

    res.forEach(i => {
      const token = transform(i.input.params[0])
      const balance = i.output
      sdk.util.sumSingleBalance(balances, token, balance)
    })

    fixBalances(balances)
    return balances
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
