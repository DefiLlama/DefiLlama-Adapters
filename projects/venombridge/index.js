const sdk = require("@defillama/sdk")
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  timetravel: false,
  venom: {
    tvl: venomTvl,
  },
}

const chains = ['ethereum', 'bsc', 'fantom', 'polygon', 'avax']
const tvl = sumTokensExport({ owner: '0x4aB740157721105aE503fbad756a578171512525', fetchCoValentTokens: true, })

chains.forEach(chain => module.exports[chain] = { tvl })

async function venomTvl() {
  const promises = chains.map(chain => sdk.api.erc20.totalSupply({ chain, target: '0x46f84dc6564cdd93922f7bfb88b03d35308d87c9' }))
  const totalSupplies = await Promise.all(promises)
  const bal = totalSupplies.reduce((acc, supply) => acc + supply.output / 1e9, 0)
  return { 'venom': bal }
}