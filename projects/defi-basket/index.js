const { post } = require('../helper/http')

async function tvl() {
  const body = {"pageIndex":0,"sortBy":"pnl","nameQuery":"","filterValue":10,"nftIds":null,"filterCategory":[]}
  let tether = 0
  let res
  do {
    res = await post('https://www.usepicnic.com/api/get-portfolios', body)
    res.portfolios.forEach(i => tether += i.value)
    body.pageIndex += 1
  } while(res.pagination.hasNext)
  return {
    tether
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "The TVL is calculated by summing the value of all assets that are in the wallets deployed by the DeFiBasket contract.",
  polygon: {
    tvl
  },
}
