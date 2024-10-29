const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  let target = "0x888099De8EA8068D92bB04b47A743B82195c4aD2"
  const pairs = await api.fetchList({ lengthAbi: 'pairLength', itemAbi: 'swapPairContract', target })
  const res = await api.fetchList({  lengthAbi: 'N_COINS', itemAbi: 'coins', targets: pairs, groupedByInput: true, })
  const ownerTokens = res.map((tokens, i) => [tokens, pairs[i]])
  return sumTokens2({ api, ownerTokens, permitFailure: true, })
}

module.exports = {
  methodology:
    "Uses factory(0x888099De8EA8068D92bB04b47A743B82195c4aD2) address and whitelisted tokens address to find and price Liquidity Pool pairs",
  start: 1729159200,
  sapphire: {
    tvl,
  },
};
