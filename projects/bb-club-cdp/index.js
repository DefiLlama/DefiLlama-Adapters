const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  bouncebit: {
    tvl: sumTokensExport({ owner: '0xdE1F1Ff02D565E554E63AEfe80cB6818eAaCD6A8', token: '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'}),
  }
}