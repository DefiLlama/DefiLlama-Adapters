const { sumERC4626VaultsExport } = require('../helper/erc4626')
const { staking } = require('../helper/staking')

const Locus_Token = "0xe1d3495717f9534db67a6a8d4940dd17435b6a9e"
const stLocus = "0xEcc5e0c19806Cf47531F307140e8b042D5Afb952"

module.exports = {
  doublecounted: true,
  hallmarks: [
    [Math.floor(new Date('2023-12-30')/1e3), 'Was hacked for 321k'], // https://twitter.com/Locus_finance/status/1744374506267767267
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
      xUSD: "0x2a889E9ef10c7Bd607473Aadc8c806c4511EB26f",
    },
  }
}

Object.keys(config).forEach(chain => {
  const { lvTokens } = config[chain]
  module.exports[chain] = {
    tvl: sumERC4626VaultsExport({ vaults: Object.values(lvTokens), tokenAbi: 'token', balanceAbi: 'totalAssets' })
  }
})

module.exports.arbitrum.staking = staking(stLocus, Locus_Token)
