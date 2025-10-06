const { sumTokens2 } = require('../helper/unwrapLPs');
const { fetchURL } = require('../helper/utils')

async function tvl(api, isBorrows) {
  const { data } = await fetchURL("https://mainnet-dapp1.sunube.net:7740/query/F4E33267A8FF1ACCE3C6D7B441B8542FB84FF6DAA5114105563D2AA34979BEF6?type=get_stats_supply_deposit");

  data.map(({ asset_id, total_borrow, total_deposit, price, decimals }) => {
    // const multiplier = price/10 **decimals
    // total_borrow = total_borrow *  multiplier
    // total_deposit = total_deposit *  multiplier
    // const balance = isBorrows ? total_borrow : total_deposit - total_borrow
    // api.addUSDValue(balance)
    const balance = isBorrows ? total_borrow : total_deposit - total_borrow
    api.add(asset_id, balance)
  })
  return sumTokens2({ api })
}

module.exports = {
  timetravel: false,
  chromia: {
    tvl: (api) => tvl(api, false),
    borrowed: (api) => tvl(api, true),
  },
}