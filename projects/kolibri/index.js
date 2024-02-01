const { toUSDTBalances } = require('../helper/balances');
const { get } = require("../helper/http");
const { getConfig } = require('../helper/cache')

const tvlUrl = 'https://kolibri-data.s3.amazonaws.com/mainnet/totals.json';

async function tvl() {
  const url = 'https://kolibri-data.s3.amazonaws.com/mainnet/oven-data.json'
  await getConfig('kolibri', url)
  const { allOvenData } = await get(url)
  const filtered = allOvenData.filter(oven => !oven.isLiquidated && +oven.balance > 1e5)
  return {
    tezos: filtered.reduce((tvl, oven) => tvl + +oven.balance / 1e6, 0)
  }
}

async function pool2() {
  return toUSDTBalances((await get(tvlUrl)).quipuswapFarmBalanceUSD);
}
module.exports = {
  methodology: 'TVL counts the XTZ tokens that are deposited to mint kUSD, and kUSD in the liquidity pool. Borrowed tokens are not counted.',
  tezos: {
    tvl,
    pool2
  }
};
