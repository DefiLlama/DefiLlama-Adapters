const {
  getNumMarkets,
  getMarketTokenAddress,
  getMarketTotalPar,
} = require("./dolomite-margin.json");

const dolomiteMargin = "0x6bd780e7fdf01d77e4d475c821f1e7ae05409072";

async function getTokensAndBalances(api, supplyOrBorrow) {
  const tokens = await api.fetchList({ lengthAbi: getNumMarkets, itemAbi: getMarketTokenAddress, target: dolomiteMargin })
  const underlyingTokens = await api.multiCall({ abi: 'address:UNDERLYING_TOKEN', calls: tokens, permitFailure: true, })
  let bals
  if (supplyOrBorrow === 'supply') {
    bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(i => ({ target: i, params: dolomiteMargin })), })

  } else {
    const res = await api.fetchList({ lengthAbi: getNumMarkets, itemAbi: getMarketTotalPar, target: dolomiteMargin })
    bals = res.map(i => i.borrow)
  }
  tokens.forEach((v, i) => {
    api.add(underlyingTokens[i] ?? v, bals[i])
  })
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
