const {fetchURL} = require('../helper/utils')

async function tvl(isBorrows) {
    const { data } = await fetchURL("https://mainnet-dapp1.sunube.net:7740/query/F4E33267A8FF1ACCE3C6D7B441B8542FB84FF6DAA5114105563D2AA34979BEF6?type=get_stats_supply_deposit");
      
    const balances = {}
    data.map(({ asset_id, total_borrow, total_deposit }) => {
      balances[`chromia:${asset_id}`] = isBorrows ? total_borrow : total_deposit - total_borrow
    })

    return balances 
}

module.exports = {
    timetravel: false,
    chromia: {
        tvl: () => tvl(false),
        borrowed: () => tvl(true),
    },
}