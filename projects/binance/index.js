const config = require('./config')
const { getBalance } = require('../helper/utils')
const tronHelper = require('../helper/tron')
const { sumTokensExport } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

module.exports = {
  timetravel: false,
};

const chains = Object.keys(config).filter(i => i !== 'bep2')

chains.forEach(chain => {
  const { addresses, tokensAndOwners, } = config[chain]
  if (addresses) {
    module.exports[chain] = {
      tvl: getChainTvl(chain),
    }
  } else if (chain === 'tron') {
    module.exports.tron = {
      tvl: async () => tronHelper.sumTokens({ tokensAndOwners })
    }
  } else {
    module.exports[chain] = {
      tvl: sumTokensExport({ tokensAndOwners, chain, })
    }
  }
})


const bscTvl = module.exports.bsc.tvl
module.exports.bsc.tvl = sdk.util.sumChainTvls([
  bscTvl, getChainTvl('bep2')
])

function getChainTvl(chain) {
  const { addresses, geckoId, noParallel = false } = config[chain]
  return async () => {
    let balance = 0
    if (noParallel) {
      for (const account of addresses)
        balance += await getBalance(chain, account)
    } else {
      balance = (await Promise.all(addresses.map(i => getBalance(chain, i)))).reduce((a, i) => a + i, 0)
    }
    return {
      [geckoId]: balance
    }
  }
}
