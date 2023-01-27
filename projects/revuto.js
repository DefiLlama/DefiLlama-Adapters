const { toUSDTBalances } = require("./helper/balances");
const { get } = require('./helper/http')

async function staking() {
  const url = 'https://production-testing.revuto.com/api/v1/wallet/total_revu_staked_usd';
  return toUSDTBalances((await get(url)))
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    cardano: {
        tvl: () => ({}),
        staking
    }
};