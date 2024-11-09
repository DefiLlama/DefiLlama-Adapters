const { sumUnknownTokens } = require('../helper/unknownTokens')

const config = {
  core: {
    vaults: [
      "0x3132CDD419820f0D00152b95267FA013783e1F27",
      "0x88f95f59c0FC1e9857188218F23315ECe6f64CFe",
      "0xF71552C9893BDFf01a4a2debaB80E21b6E0e9481",
      "0x1D165E1D48177592943275750C7ABeB946D44a6e",
      "0x11606ce0D44a62027F6EEb28db7483E5ecB1103f",
      "0xe79E557bf863383EB666197e96e73ACEFBf71347",
      "0x91C143ED78970a4C3830070c6c1FA38EEc9F8c6E",
      "0xE891d51D278518e522148271b65ec3a534012389",
      "0xc09849236c5De1317e9a957cF695642285A2A5E2",
      "0x0dc152dDC49e0f872489297D6Df0ef3Bb5498FF2",
      "0xBafA023c72112ecfc04E661bedb30d9A8e7e08ad",
      "0x746f5530FBebDcf984F0D15637f0217eb7cDcE73",
      "0x87c98004D1F819fB6354CeD704304a1394Ac1F16",
      "0x5D884E045d8F74E3b600c359395A300515b6F574",
      "0x1f0c2507C500F24fdd765Dc4025E5c5b40FC33c3"
    ]
  }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { vaults } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:want', calls: vaults })
      const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults })
      api.addTokens(tokens, bals)
      return sumUnknownTokens({ api , useDefaultCoreAssets: true, resolveLP: true, lps: tokens })
    }
  }
})