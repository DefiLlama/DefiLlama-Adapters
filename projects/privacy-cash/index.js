const { sumTokensExport } = require('../helper/solana')
const { sumTokensExport: evmSumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: 'Total value of all coins held in the smart contracts of the protocol',
  solana: {
    tvl: sumTokensExport({
      owners: ['2vV7xhCMWRrcLiwGoTaTRgvx98ku98TRJKPXhsS8jvBV'],
      tokens: [
        ADDRESSES.solana.USDC,
        ADDRESSES.solana.USDT,
        'A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS', // ZEC
        'oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp', // ORE
        'sTorERYB6xAZ1SSbwpK3zoK2EEwbBrc7TZAzg1uCGiH', // legacy STORE
        'storenSbvkfzircixnaosc5CbzNZVrHJ6S3EKrS1yqR', // STORE
        '9BEcn9aPEmhSPbPQeFGjidRiEKki46fVQDyPpSQXPA2D', // jlUSDC
        '2uQsyo1fXXQkDtcpXnLofWy88PxcvnfH2L8FPSE62FVU', // jlwSOL
      ],
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
  ethereum: {
    tvl: evmSumTokensExport({
      owners: [
        '0x77A10AE3E513c2D73D73eb52212c6918C8830dd0',
        '0xC88F4dF2B6EdDd6B6Bdf95A0177f50C90Fa7527f',
      ],
      tokens: [ADDRESSES.null, ADDRESSES.ethereum.USDT],
    })
  },
  bsc: {
    tvl: evmSumTokensExport({
      owners: [
        '0x22D8509E7AF58b1EaFB311f8F76E81dC3a391F77',
        '0x9926A40B0879b36F9586c4285f0fae597bd56313',
      ],
      tokens: [ADDRESSES.null, ADDRESSES.bsc.USDT],
    })
  },
  robinhood: {
    tvl: evmSumTokensExport({
      owners: ['0xEC5266c9e44631e1ba22FD6377C38130c1F3B738'],
      tokens: [ADDRESSES.null],
    })
  },
}
