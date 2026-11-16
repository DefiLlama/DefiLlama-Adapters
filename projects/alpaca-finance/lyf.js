const { getConfig } = require('../helper/cache')

async function getProcolAddresses(chain) {
  if (chain == 'bsc') {
    return (
      await getConfig('alpaca-finance/lyf-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
      )
    )
  }
  if (chain == 'fantom') {
    return (
      await getConfig('alpaca-finance/lyf-fantom',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.fantom_mainnet.json"
      )
    )
  }
}

module.exports = {
  getProcolAddresses
}
