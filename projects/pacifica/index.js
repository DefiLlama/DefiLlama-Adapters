const { sumTokensExport } = require('../helper/solana')

module.exports = {
  solana: { tvl: sumTokensExport({ tokenAccounts: ['72R843XwZxqWhsJceARQQTTbYtWy6Zw9et2YV4FpRHTa', 'FvGqozihHY4Mmh4Nmx2rkXnMDcumiXEbjxA9oRu3mUeJ'] }) }
}