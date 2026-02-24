const { fetchURL } = require("./utils")
const sdk = require('@defillama/sdk')

const MONTH = 30 * 24 * 3600e3

const chainMapping = {
  "Gnosis": "xdai",
  "Avalanche": "avax",
  "Binance": "bsc"
}

async function karpatKeyTvl(api, daoName, tokenToExclude) {
  const { data } = await fetchURL("https://aumapi.kpk.dev/our_daos_token_details")
  let date = new Date(api.timestamp * 1e3)
  let monthlyData = data.tokens.filter(t => t.year_month === `${date.getFullYear()}_${date.getMonth() + 1}` && t.dao === daoName)
  while (monthlyData.length === 0) {
    if (api.timestamp * 1e3 - date.getTime() > 3 * MONTH) {
      throw new Error(`Treasury snapshot too outdated`)
    }
    date = new Date(date.getTime() - MONTH)
    monthlyData = data.tokens.filter(t => t.year_month === `${date.getFullYear()}_${date.getMonth() + 1}` && t.dao === daoName)
  }
  const balances = {}
  monthlyData.forEach(bal => {
    if (tokenToExclude !== bal.token_symbol && bal.value) {
      const chain = chainMapping[bal.blockchain] ?? bal.blockchain.toLowerCase()
      // api.log(`Adding ${bal.token_symbol} on ${chain} with address ${bal.token_address} and value ${bal.value}`)
      sdk.util.sumSingleBalance(balances, chain + ':' + bal.token_address, bal.value)
    } else {
      api.log(`Skipping ${bal.token_symbol}`)
    }
  })
  return balances
}

module.exports = {
  karpatKeyTvl
}