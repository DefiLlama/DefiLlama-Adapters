const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')

function treasuryExports(config) {
  const chains = Object.keys(config)
  const exportObj = {  }
  chains.forEach(chain => {
    let { ownTokenOwners, ownTokens  } = config[chain]
    if (chain === 'solana')  options.solOwners = owners
    exportObj[chain] = { tvl: sumTokensExport(config[chain]) }

    if (ownTokenOwners && ownTokens) {
      const options = { ...config[chain], owners: ownTokenOwners, tokens: ownTokens, chain, }
      exportObj[chain].ownTokens = sumTokensExport(options)
    }
  })
  return exportObj
}

module.exports = {
  nullAddress,
  treasuryExports,
}
