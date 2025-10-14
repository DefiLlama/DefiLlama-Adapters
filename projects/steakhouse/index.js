const { getCuratorExport } = require("../helper/curators");

const configs = {
  methodology: 'Count all assets are deposited in all vaults curated by Steakhouse Financial.',
  blockchains: {
    ethereum: {
      morphoVaultOwners: [
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
        '0x255c7705e8BB334DfCae438197f7C4297988085a',
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0xc01Ba42d4Bd241892B813FA8bD4589EAA4C60672',
      ],
      mellow: [
        '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
        '0x9707f14B6c8200CBf6c6F2c5498D1D0019A5f15A',
        '0x4C797D53f4772325A8aDFd509F13A2d60Daa7d02',
        '0x5E362eb2c0706Bd1d134689eC75176018385430B',
      ]
    },
    base: {
      morphoVaultOwners: [
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
      ],
    },
    corn: {
      morphoVaultOwners: [
        '0x84ae7f8eb667b391a5ae2f69bd5a0e4b5b77c999',
      ],
    },
    unichain: {
      morphoVaultOwners: [
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
      ],
    },
    arbitrum: {
      morphoVaultOwners: [
        '0x0000aeB716a0DF7A9A1AAd119b772644Bc089dA8',
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
      ],
    },
    katana: {
      morphoVaultOwners: [
        '0x0A0e559bc3b0950a7e448F0d4894db195b9cf8DD',
      ],
    },
    solana: {
      kaminoVaults: [
        'HDsayqAsDWy3QvANGqh2yNraqcD8Fnjgh73Mhb3WRS5E',
        'BqBsS4myH82S4yfqeKjXSF7yErWwSi5WTshSzKmHQgzw',
        'BEEfo7xwgK2ZP13Pxo7qqTPzAteKJmXjVWtMWcXSvbn2',
        'BoZDRc1RDY9FzUZZ19WT4GbtTnnbXQ8AGSU5ByEw3ut5',
      ]
    }
  }
}

module.exports = getCuratorExport(configs)

if (configs.blockchains.solana?.kaminoVaults?.length > 0) {
  if (!module.exports.solana) module.exports.solana = {}

  module.exports.solana.tvl = async (api) => {
    const { get } = require('../helper/http')

    for (const vaultAddress of configs.blockchains.solana.kaminoVaults) {
      try {
        const metrics = await get(`https://api.kamino.finance/kvaults/${vaultAddress}/metrics?env=mainnet-beta`)
        if (metrics?.tokensInvestedUsd) {
          api.addUSDValue(parseFloat(metrics.tokensInvestedUsd))
        } else {
          console.error(`Could not fetch TVL for Kamino vault ${vaultAddress}: Unexpected response format`)
        }
      } catch (e) {
        console.error(`Could not fetch TVL for Kamino vault ${vaultAddress}:`, e.message)
      }
    }

    return api.getBalances()
  }
}
