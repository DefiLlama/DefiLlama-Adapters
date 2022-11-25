const { get } = require('./helper/http')
const { log } = require('./helper/utils')
const { transformBalances } = require('./helper/portedTokens')
const sdk = require('@defillama/sdk')

async function tvl() {
  const balances = {}
  let next
  const baseURI = 'https://ocean.defichain.com/v0/mainnet/loans/vaults?size=100'
  let page = 0
  do {
    let endpoint = baseURI
    if (next) endpoint += '&next=' + next

    log('fetchin: ', ++page)
    const res = await get(endpoint)
    next = res.page?.next

    res.data.forEach(({ collateralAmounts }) => {
      collateralAmounts.forEach(({ amount, symbol }) => {
        sdk.util.sumSingleBalance(balances, symbol, +amount)
      })
    })
  } while (next)

  delete balances.DUSD
  return transformBalances('defichain', balances)
}

module.exports = {
  methodology: "Collateral backing loans in the platform, DUSD is excluded",
  timetravel: false,
  defichain: {
    tvl
  }
}
