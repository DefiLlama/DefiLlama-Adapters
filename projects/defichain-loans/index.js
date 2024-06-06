const { get } = require('../helper/http')
const { log } = require('../helper/utils')
const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

async function tvl() {
  const balances = {}
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
        sdk.util.sumSingleBalance(balances, symbol, +amount)
      })
      loanAmounts.forEach(({ amount, symbol }) => {
        if (symbol === 'DUSD')
          sdk.util.sumSingleBalance(balances, symbol, +amount * -1)
      })
    })
  } while (next)

  balances.DUSD *= 0.7 // value is reduced by 30% to compensate for DEX stability fees 
  return transformBalances('defichain', balances)
}

module.exports = {
  methodology: "Collateral backing loans in the platform, DUSD is excluded",
  timetravel: false,
  defichain: {
    tvl
  }
}
