const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')
const { covalentGetTokens } = require('./http')

function treasuryExports(config) {
  const chains = Object.keys(config)
  const exportObj = {  }
  chains.forEach(chain => {
    let { ownTokenOwners = [], ownTokens, owners = [], fetchTokens = false } = config[chain]
    if (chain === 'solana')  config[chain].solOwners = owners
    const tvlConfig = { ...config[chain] }
    tvlConfig.blacklistedTokens = ownTokens
    if(fetchTokens === true){
      exportObj[chain] = { tvl: async (_, _b, _cb, { api }) => {
        const tokens = await Promise.all(owners.map(address=>covalentGetTokens(address, chain)))
        const uniqueTokens = new Set([...config[chain].tokens, ...tokens.flat()])
        tvlConfig.tokens = Array.from(uniqueTokens)
        return sumTokensExport(tvlConfig)(_, _b, _cb, api)
      }}
    } else {
      exportObj[chain] = { tvl: sumTokensExport(tvlConfig) }
    }

    if (ownTokens) {
      const { solOwners, ...otherOptions } = config[chain]
      const options = { ...otherOptions, owners: [...owners, ...ownTokenOwners], tokens: ownTokens, chain, resolveUniV3: false, }
      exportObj[chain].ownTokens = sumTokensExport(options)
    }
  })
  return exportObj
}

module.exports = {
  nullAddress,
  treasuryExports,
}
