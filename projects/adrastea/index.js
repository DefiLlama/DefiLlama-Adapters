const { sumTokensExport } = require('../helper/solana')
module.exports = {
  solana: {
    tvl: sumTokensExport({ owners: ['DSsS7nzPv1AhX5UKYMWYSioyd3E8w9QjnTjNA7kyQzVA'] })
  }
}
