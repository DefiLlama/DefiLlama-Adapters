const sdk = require('@defillama/sdk')

module.exports = {
  hallmarks: [
    [1674820800, "Vaults Pause"]
  ],
  methodology: 'TVL counts deposits made to the Robo-Vault vaults. Data is pulled from the Robo-Vault API:"https://api.robo-vault.com/vault".',
}

const config = {
  avax: {
    vaults: [
      '0x7A6fC041274FF996E2761e02F4b3B4b0f16e955A',
      '0x49d743E645C90ef4c6D5134533c1e62D08867b14',
      '0xca99b7Ad739Da614BFd6aB70d885CEf80538470a',
      '0x7fc282B1B6162733084eE3F882624e2BD1ed941E',
    ]
  },
  fantom: {
    vaults: [
      '0x1B6ecdA7Fd559793c0Def1F1D90A2Df4887B9718',
      '0xd10112521e860bdE82FD34f88113052e434930C4',
      '0x92D2DdF8eed6f2bdB9a7890a00B07a48C9c7A658',
      '0x38Da23Ef41333bE0d309Cd63166035FF3b7E2000',
      '0x13994411Eda808B354F62db5490B344F431499ae',
      '0x81F0f4fDF5148f09aAE811b5995D94F703ED0963',
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { vaults } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}
      const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
      const tokens = await api.multiCall({ abi: 'address:token', calls: vaults })
      tokens.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, bals[i], api.chain))
      return balances
    }
  }
})