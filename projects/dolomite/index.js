const {
  getNumMarkets,
  getMarketTokenAddress,
  getMarketTotalPar,
} = require("./dolomite-margin.json");
const { sumTokens2 } = require('../helper/unwrapLPs')

const dolomiteMargin = "0x6bd780e7fdf01d77e4d475c821f1e7ae05409072";

async function getTokensAndBalances(api, supplyOrBorrow) {
  const tokens = await api.fetchList({ lengthAbi: getNumMarkets, itemAbi: getMarketTokenAddress, target: dolomiteMargin })
  if (supplyOrBorrow === 'supply')
    return sumTokens2({ owner: dolomiteMargin, api, tokens })

  const res = await api.fetchList({ lengthAbi: getNumMarkets, itemAbi: getMarketTotalPar, target: dolomiteMargin })
  res.forEach((v, i) => api.addToken(tokens[i], v.borrow))
}

async function tvl(timestamp, ethereumBlock, blocksToKeys, { api }) {
  return getTokensAndBalances(api, "supply");
}

async function borrowed(timestamp, ethereumBlock, blocksToKeys, { api }) {
  return getTokensAndBalances(api, "borrow");
}

module.exports = {
  start: 1664856000,  // 10/4/2022 @ 00:00am (UTC)
  arbitrum: {
    tvl,
    borrowed
  },
};
