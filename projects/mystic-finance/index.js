const { getMorphoVaultTvl } = require('../helper/morpoho');

const config = {
  plume_mainnet: {
    morphoVaults: [
      '0xc0Df5784f28046D11813356919B869dDA5815B16',
      '0x0b14D0bdAf647c541d3887c5b1A4bd64068fCDA7',
      '0xBB748a1346820560875CB7a9cD6B46c203230E07'
    ],
  },
  flare: {
    morphoVaults: [
      '0xe8dd6a1e13244a27bdaa19ccbf33013647c675d1',
      '0x1aeada3c251215f1294720b80fcb3d1d005f3585',
      '0x53184adabf312b490bf1ebcfdc896feff6019a14'
    ],
  }
}

module.exports = {
  doublecounted: true,
  plume_mainnet: { 
    tvl: getMorphoVaultTvl(undefined, {
    vaults: config.plume_mainnet.morphoVaults,
    morphoFactory: "0x2525D453D9BA13921D5aB5D8c12F9202b0e19456",
    }), 
  },
  flare: {
    tvl: getMorphoVaultTvl(undefined, {
      vaults: config.flare.morphoVaults,
      morphoFactory: "0x6FC83ECc0e8142635D77200e5052be8A0a9D2f42",
    }),
  }
}