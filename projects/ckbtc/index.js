const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  methodology: `We count the BTC as the collateral for the ckBTC`,
  bitcoin: { tvl: sumTokensExport({ owner: 'bc1q0jrxz4jh59t5qsu7l0y59kpfdmgjcq60wlee3h'}) },
}
