module.exports = {
  misrepresentedTokens: true,
  hallmarks: [
    [1670856656, "Launch GLP Vaults"]
  ],
  arbitrum: {
    tvl: async (api) => {
      const vaults = [
        '0x1d42783E7eeacae12EbC315D1D2D0E3C6230a068',  // tricrypto
        '0xf9305009fba7e381b3337b5fa157936d73c2cf36',  // dnGmxSeniorVault
        '0x8478ab5064ebac770ddce77e7d31d969205f041e',  // dnGmxJuniorVault
      ]
      const bals = await api.multiCall({
        abi: 'int256:getVaultMarketValue', calls: vaults,
      })

      return {
        tether: bals.reduce((a, i) => a + i / 1e6, 0),
      }
    }
  }
}