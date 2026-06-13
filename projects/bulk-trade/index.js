const { sumTokensExport } = require('../helper/solana')

module.exports = {
  timetravel: false,
  solana: {
    tvl: sumTokensExport({
      tokenAccounts: [
        'HwdwwKH1tMXo7ggTKcA5cdQrpcgqSoVib2eQh3BiyEQL',
      ]
    })
  },
  methodology: 'Counts USDC deposited into the Bulk Trade Season 1 pre-deposits.',
}
