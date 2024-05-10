const { sumTokens2 } = require('./helper/solana')
const { getConfig } = require('./helper/cache')

async function tvl() {
  const { pools } = await getConfig('atrix-v1', 'https://api.atrix.finance/api/all')
  return sumTokens2({ tokenAccounts: pools.map(({ marketData: { coinVault, pcVault } }) => [coinVault, pcVault]).flat() })
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  hallmarks: [
    [1665521360, "Mango Markets Hack"],
    [1667865600, "FTX collapse"]
  ],
}
