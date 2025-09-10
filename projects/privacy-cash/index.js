const { sumTokensExport } = require('../helper/solana')

module.exports = {
  methodology: 'Value of SOL in the privacy cash pool',
  solana: { tvl: sumTokensExport({ solOwners: ['4AV2Qzp3N4c9RfzyEbNZs2wqWfW4EwKnnxFAZCndvfGh'] }) },
}