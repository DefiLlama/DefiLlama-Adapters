const { post } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");
const { default: BigNumber } = require("bignumber.js");
const { ethers } = require("ethers");

async function getTvl() {
  const { api } = arguments[3];
  const { endpoint } = config[api.chain];

  const result = await post(endpoint, {"account":ethers.ZeroAddress,"pageNum":1,"pageSize": 10000});

  const tvl =  result?.data?.records?.reduce((acc, item) => {
    return acc.plus(item?.lpTvl || 0)
  }, new BigNumber(0))


  return toUSDTBalances(tvl?.toFixed() || '0')
}

module.exports = {
  misrepresentedTokens: false,
  timetravel: true,
};

const config = {
  arbitrum: { endpoint: "https://api-arb.myx.finance/lp/mlpBuy/stat/page" },
  linea: { endpoint: "https://api-linea.myx.finance/lp/mlpBuy/stat/page" },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: getTvl };
});
