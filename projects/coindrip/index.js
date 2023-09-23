const { toUSDTBalances } = require("../helper/balances");
const { get } = require("../helper/http");
const { sumTokensExport } = require('../helper/sumTokens')
const { getCoreAssets } = require('../helper/tokenMapping')

const API_URL = "https://app.coindrip.finance/api/tvl";

async function tvl() {
  const data = await get(API_URL);
  return toUSDTBalances(data);
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ owner: 'erd1qqqqqqqqqqqqqpgqqnm3x37972323nuv3l3kywev0n8q5n6gyc8qwljqz9', whitelistedTokens: getCoreAssets('elrond')}),
    vesting: sumTokensExport({ owner: 'erd1qqqqqqqqqqqqqpgqqnm3x37972323nuv3l3kywev0n8q5n6gyc8qwljqz9', blacklistedTokens: getCoreAssets('elrond')}),
  },
};