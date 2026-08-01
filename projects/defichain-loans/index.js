const { get } = require('../helper/http')
const { log } = require('../helper/utils')

async function tvl(api) {
  let next
  const baseURI = 'https://ocean.defichain.com/v0/mainnet/loans/vaults?size=100'
  let page = 0
  do {
    let endpoint = baseURI
    if (next) endpoint += '&next=' + next

    log('fetchin: ', ++page, next)
    const res = await get(endpoint)
    next = res.page?.next

    res.data.forEach(({ collateralAmounts = [], loanAmounts = [], }) => {
      collateralAmounts.forEach(({ amount, symbol }) => {
        if (symbol === 'DUSD')
          amount *= 0.7 // value is reduced by 30% to compensate for DEX stability fees
        api.add(symbol, +amount)
      })
      loanAmounts.forEach(({ amount, symbol }) => {
        if (symbol === 'DUSD')
          api.add(symbol, +amount * 0.7 * -1)
      })
    })
  } while (next)
}

module.exports = {
  methodology: "Collateral backing loans in the platform, DUSD is excluded",
  timetravel: false,
  defichain: {
    tvl
  }
}
