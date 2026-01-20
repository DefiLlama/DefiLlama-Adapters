const { sumTokensExport } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Value of SOL + USDC in the privacy cash pool',
  solana: { tvl: sumTokensExport({
    owners: ['2vV7xhCMWRrcLiwGoTaTRgvx98ku98TRJKPXhsS8jvBV'],
    tokens: [ADDRESSES.solana.USDC, ADDRESSES.solana.USDT, 'A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS', 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp', 'sTorERYB6xAZ1SSbwpK3zoK2EEwbBrc7TZAzg1uCGiH'],
    solOwners: ['4AV2Qzp3N4c9RfzyEbNZs2wqWfW4EwKnnxFAZCndvfGh']
  }) },
}
