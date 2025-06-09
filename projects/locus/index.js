const sdk = require('@defillama/sdk')
const { sumERC4626VaultsExport } = require('../helper/erc4626')
const { staking } = require('../helper/staking')

const Locus_Token = "0xe1d3495717f9534db67a6a8d4940dd17435b6a9e"
const stLocus = "0xEcc5e0c19806Cf47531F307140e8b042D5Afb952"

module.exports = {
  doublecounted: true,
  hallmarks: [
    ['2023-12-30', 'Was hacked for 321k'], // https://twitter.com/Locus_finance/status/1744374506267767267
  ],
}

const config = {
  ethereum: {
    lvTokens: {
      xETH: "0x0CD5cda0E120F7E22516f074284e5416949882C2",
      xDEFI: "0xB0a66dD3B92293E5DC946B47922C6Ca9De464649",
    }
  },
  arbitrum: {
    lvTokens: {
      xARB: "0xF8F045583580C4Ba954CD911a8b161FafD89A9EF",
      pendleETH: "0x515f3533a17E2EEFB13313D9248f328C94dBe641"
    },
    lvTokens2: {
      xUSD: "0x6318938F825F57d439B3a9E25C38F04EF97987D8",
    },
  }
}

Object.keys(config).forEach(chain => {
  const { lvTokens, lvTokens2 } = config[chain]
  let tvl = sumERC4626VaultsExport({ vaults: Object.values(lvTokens), tokenAbi: 'token', balanceAbi: 'totalAssets' })
  if (lvTokens2)
    tvl = sdk.util.sumChainTvls([tvl, sumERC4626VaultsExport({ vaults: Object.values(lvTokens2), tokenAbi: 'wantToken', balanceAbi: 'totalAssets' })])
  module.exports[chain] = {
    tvl
  }
})

module.exports.arbitrum.staking = staking(stLocus, Locus_Token)
