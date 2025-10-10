const { getMorphoVaultTvl } = require('../helper/morpoho');

const config = {
  plume_mainnet: {
    morphoVaults: [
      '0xc0Df5784f28046D11813356919B869dDA5815B16',
      '0x0b14D0bdAf647c541d3887c5b1A4bd64068fCDA7',
      '0xBB748a1346820560875CB7a9cD6B46c203230E07'
    ],
  },
}

module.exports = {
  doublecounted: true,
  plume_mainnet: { 
    tvl: getMorphoVaultTvl(undefined, {
    vaults: config.plume_mainnet.morphoVaults,
    morphoFactory: "0x2525D453D9BA13921D5aB5D8c12F9202b0e19456",
    }), 
  },
}