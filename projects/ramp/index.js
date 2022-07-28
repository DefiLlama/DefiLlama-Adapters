const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const axios = require("axios");
const { getBlock } = require("../helper/getBlock");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform } = require('../helper/portedTokens')

async function getConfig(network) {
  return await axios.get('https://config.rampdefi.com/config/appv2/priceInfo').then(response => response.data[network]);
}

function isLPToken(token, chain) {
  if (chain === 'bsc') return token.includes('CAKELP')
  if (chain === 'ethereum') return token.includes('UNIV2')
  if (chain === 'polygon') return token.includes('UNIV2')
}

function getChainTVL(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    let lpPositions = []
    const block = await getBlock(timestamp, chain, chainBlocks);
    const config = await getConfig(chain === 'ethereum' ? 'eth' : chain);
    const tokens = config.tokens;
    const transform = await getChainTransform(chain)
    const promises = []

    for (const [tokenName, token] of Object.entries(tokens)) {
      if (token?.strategy?.type === undefined) continue
      const tokenAddress = token.address.toLowerCase();

      promises.push((async () => {
        const tokenTVL = await sdk.api.abi.call({
          abi: abi.getPoolAmount,
          target: token.strategy.address,
          params: tokenAddress,
          chain: chain,
          block,
        })

        const prefixedTokenAddress = transform(tokenAddress)
        sdk.util.sumSingleBalance(balances, prefixedTokenAddress, tokenTVL.output)

        if (isLPToken(tokenName, chain)) {
          lpPositions.push({
            token: tokenAddress,
            balance: balances[prefixedTokenAddress]
          })
          delete balances[prefixedTokenAddress]
        }
      })())
    }

    await Promise.all(promises)

    await unwrapUniswapLPs(balances, lpPositions, block, chain, transform)

    // Workaround for rUSD (price not being found)
    // Use coingecko id
    if (chain === 'polygon') {
      const rUSD = 'polygon:0xfc40a4f89b410a1b855b5e205064a38fc29f5eb5'
      balances['RUSD'] = parseFloat(balances[rUSD]) / (10 ** 18)
      delete balances[rUSD]
    }

    return balances
  }
}

module.exports = {
  ethereum: {
    tvl: getChainTVL('ethereum')
  },
  bsc: {
    tvl: getChainTVL('bsc')
  },
  polygon: {
    tvl: getChainTVL('polygon')
  },
}
