const ADDRESSES = require('../helper/coreAssets.json')
const factory = '0xbFC5229ab471c54B58481fA232CFd4a18371C51C'

async function tvl(api) {
  const pairs = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factory })
  return api.sumTokens({ owners: pairs, tokens: [ADDRESSES.bsc.WBNB], })
}

module.exports = {
  methodology: "TVL is counted as the amount of BNB locked in the AMM pools",
  bsc: {
    tvl,
  },
}