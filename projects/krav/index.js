const { getConfig } = require("../helper/cache");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require("../helper/balances");

const getBaseInfo = async () => {
  const resp = await getConfig('krav', 'https://base-api.krav.trade/krav/v1/overview')
  return toUSDTBalances((new BigNumber(resp.data.liquiditySupply).div(10000).toString()))
}

module.exports = {
  base: {
    tvl: getBaseInfo
  }
}
