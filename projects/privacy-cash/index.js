const { sumTokensExport } = require('../helper/solana')
const { sumTokensExport: evmSumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Total value of all coins held in the smart contracts of the protocol',
  solana: {
    tvl: sumTokensExport({
      owners: ['2vV7xhCMWRrcLiwGoTaTRgvx98ku98TRJKPXhsS8jvBV'],
      tokens: [ADDRESSES.solana.USDC, ADDRESSES.solana.USDT, 'A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS', 'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp', 'sTorERYB6xAZ1SSbwpK3zoK2EEwbBrc7TZAzg1uCGiH'],
      solOwners: ['4AV2Qzp3N4c9RfzyEbNZs2wqWfW4EwKnnxFAZCndvfGh']
    })
  },
  base: {
    tvl: evmSumTokensExport({
      owners: [
        '0x7F673790C08Ddf27c0Aa6fa9526CCC8dAaB081Ec',
        '0xe91dd4AB03909f5CEb87f42B4308B222995a905b',
      ],
      tokens: [ADDRESSES.null, ADDRESSES.base.USDC],
    })
  },
}
