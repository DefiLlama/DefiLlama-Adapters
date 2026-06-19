const { sumERC4626VaultsExport2 } = require('../helper/erc4626')

const vaultsByChain = {
  hedera: [
    { name: 'Credible PayFi Vault', address: '0x6b8dfA6aa5f803a886Beb2492eF3307EC0Ee16FB' },
  ],
}

module.exports = {
  methodology:
    'Total value of assets deposited in the Byzanlink vaults, read on-chain and valued in USD.',
  ...Object.fromEntries(
    Object.entries(vaultsByChain).map(([chain, vaults]) => [
      chain,
      { tvl: sumERC4626VaultsExport2({ vaults: vaults.map((v) => v.address) }) },
    ])
  ),
}
