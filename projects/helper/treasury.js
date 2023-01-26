const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')

function treasuryExports(config) {
  const chains = Object.keys(config)
  const exportObj = {  }
  chains.forEach(chain => {
    let { ownTokenOwners = [], ownTokens, owners = [],  } = config[chain]
    if (chain === 'solana')  config[chain].solOwners = owners
    exportObj[chain] = { tvl: sumTokensExport(config[chain]) }

    if (ownTokens) {
      const { solOwners, ...otherOptions } = config[chain]
      const options = { ...otherOptions, owners: [...owners, ...ownTokenOwners], tokens: ownTokens, chain, }
      exportObj[chain].ownTokens = sumTokensExport(options)
    }
  })
  return exportObj
}

module.exports = {
  nullAddress,
  treasuryExports,
}
