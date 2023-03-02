const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')

function treasuryExports(config) {
  const chains = Object.keys(config)
  const exportObj = {  }
  chains.forEach(chain => {
    let { ownTokenOwners = [], ownTokens, owners = [],  } = config[chain]
    if (chain === 'solana')  config[chain].solOwners = owners
    const tvlConfig = { ...config[chain] }
    tvlConfig.blacklistedTokens = ownTokens
    exportObj[chain] = { tvl: sumTokensExport(tvlConfig) }

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
