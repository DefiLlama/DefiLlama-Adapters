const { sumTokens2 } = require("../helper/unwrapLPs")

const VAULTS = {
  ethereum: [
    "0x221042C39EfFfCfF8FaD051032FEF583019F165F", // weeth vault
    "0xA8c3fc43Fa3992b315B8a63fe87386211F220669", // ezeth vault
    "0x950a316587B7a9277aDf13A5f4327c959472f030", // pufeth vault
    "0x6da1a9307fBf1d0a00EAF3B151f370b1925AB7e4", // swell vault
    "0x270C6FA5a206Bfc1382C6101e3F366a632bE80a2", // kelp vault
  ],
  mode: [
    "0x46b1a9e1baa54e1edda42d3831d6a48ad527900c", // weeth vault
    "0xe3583d7efc9d33269615b1c8fd0ff5836b176948", // ezeth vault
  ],
}

Object.keys(VAULTS).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = VAULTS[chain]
      const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, vaults] })
    }
  }
})
