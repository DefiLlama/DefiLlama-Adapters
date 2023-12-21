const {
  getNumMarkets,
  getMarketTokenAddress,
  getMarketTotalPar,
  getMarketCurrentIndex
} = require("./dolomite-margin.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const BigNumber = require("bignumber.js");

const dolomiteMargin = "0x6bd780e7fdf01d77e4d475c821f1e7ae05409072";
const basePar = "1000000000000000000";

async function getTokensAndBalances(api, supplyOrBorrow) {
  const tokens = await api.fetchList({
    lengthAbi: getNumMarkets,
    itemAbi: getMarketTokenAddress,
    target: dolomiteMargin
  });
  if (supplyOrBorrow === "supply")
    return sumTokens2({ owner: dolomiteMargin, api, tokens });

  const res = await api.fetchList({ lengthAbi: getNumMarkets, itemAbi: getMarketTotalPar, target: dolomiteMargin });
  const indices = await api.fetchList({
    lengthAbi: getNumMarkets,
    itemAbi: getMarketCurrentIndex,
    target: dolomiteMargin
  });
  res.forEach((v, i) => {
    return api.addToken(tokens[i], BigNumber(v.borrow.toString()).times(indices[i].borrow).div(basePar).toFixed(0));
  });
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
  }
};
