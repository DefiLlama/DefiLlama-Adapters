const { sumERC4626VaultsExport } = require('../helper/erc4626')
const { staking } = require('../helper/staking')

const CONFIG = {
  ethereum: {
    vaults: {
      v1: ['0x0CD5cda0E120F7E22516f074284e5416949882C2', '0xB0a66dD3B92293E5DC946B47922C6Ca9De464649'],
    },
  },
  arbitrum: {
    vaults: {
      v1: ['0x515f3533a17E2EEFB13313D9248f328C94dBe641'],
      v2: ['0x6318938F825F57d439B3a9E25C38F04EF97987D8'],
    },
    staking: {
      token: '0xe1d3495717f9534db67a6a8d4940dd17435b6a9e',
      contract: '0xEcc5e0c19806Cf47531F307140e8b042D5Afb952',
    },
    tvlExtra: [
      { token: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', owner: '0xF8F045583580C4Ba954CD911a8b161FafD89A9EF' },
    ],
  },
}

Object.keys(CONFIG).forEach((chain) => {
  const cfg = CONFIG[chain]

  module.exports[chain] = {
    tvl: async (api) => {
      const { vaults = {} } = cfg
      const { v1 = [], v2 = [] } = vaults

      if (v1.length) await sumERC4626VaultsExport({ vaults: v1, tokenAbi: 'token', balanceAbi: 'totalAssets' })(api)
      if (v2.length) await sumERC4626VaultsExport({ vaults: v2, tokenAbi: 'wantToken', balanceAbi: 'totalAssets' })(api)
      if (cfg.tvlExtra?.length)  await api.sumTokens({ tokensAndOwners: cfg.tvlExtra.map(({ token, owner }) => [token, owner]) })
    },
    ...(cfg.staking ? { staking: staking(cfg.staking.contract, cfg.staking.token) } : {}),
  }
})
