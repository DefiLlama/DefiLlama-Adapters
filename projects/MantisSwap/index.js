const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  polygon: { vaults: ['0x62Ba5e1AB1fa304687f132f67E35bFC5247166aD'] },
  polygon_zkevm: { vaults: ['0x12d41b6DF938C739F00c392575e3FD9292d98215'] },
  mode: { vaults: ['0x4af97f73343b226C5a5872dCd2d1c4944BDb3E77', '0xe8A1eAD2F4c454e319b76fA3325B754C47Ce1820'] },
}

const MAX_LP_TOKENS = 3

Object.keys(config).forEach(chain => {
  const { vaults } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const calls = vaults.map(vault => {
        let res = []
        for (let i = 0; i < MAX_LP_TOKENS; i++)
          res.push({ target: vault, params: i })
        return res
      }).flat()
      let lpVaults = await api.multiCall({ abi: 'function lpList(uint256) view returns (address)', calls, permitFailure: true })
      lpVaults = lpVaults.filter(v => v)
      const tokens = await api.multiCall({ abi: 'address:underlier', calls: lpVaults })
      return sumTokens2({ api, tokensAndOwners2: [tokens, lpVaults] })
    }
  }
})
