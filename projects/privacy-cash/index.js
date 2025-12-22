const { sumTokensExport } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Value of SOL + USDC in the privacy cash pool',
  solana: { tvl: sumTokensExport({
    owners: ['2vV7xhCMWRrcLiwGoTaTRgvx98ku98TRJKPXhsS8jvBV'],
    tokens: [ADDRESSES.solana.USDC],
    solOwners: ['4AV2Qzp3N4c9RfzyEbNZs2wqWfW4EwKnnxFAZCndvfGh']
  }) },
}