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
      '0xE8dd6A1e13244A27bDaa19CcBf33013647C675d1',
      '0x53184aDaBF312b490BF1EbcFdC896FEfF6019a14',
      '0x1aEadA3C251215f1294720B80FcB3D1D005F3585'
    ],
  },
  citrea: {
    morphoVaults: [
      '0x72f8C254548839Fa1Db4156aE01d8C6ae5885EE4',
    ]
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
    }),
  },
  citrea: {
    tvl: getMorphoVaultTvl(undefined, {
      vaults: config.citrea.morphoVaults,
    }),
  }
}
