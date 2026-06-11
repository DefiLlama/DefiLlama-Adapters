const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

const config = {
  klaytn: {
    vaults: [
      '0x2e4e573D86c70688cD97D76bc5DDc1Bb265bF5D6', // Super Vault (EarnUSDT)
    ],
  },
}

module.exports = {
  methodology: 'TVL is the sum of totalAssets() across SuperEarn Super Vaults on Kaia. Each Super Vault holds seCDV (CooldownVault share) as its underlying.'
}

for (const chain of Object.keys(config)) {
  module.exports[chain] = { tvl: sumERC4626VaultsExport2({vaults: config[chain].vaults, tokenAbi: 'address:token', balanceAbi: 'uint256:totalAssets'}) }
}
