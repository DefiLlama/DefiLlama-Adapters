const { sumERC4626VaultsExport2 } = require('../helper/erc4626')
const { sumTokensExport } = require('../helper/solana')

const vaults = {
  hedera: [
    "0x6b8dfA6aa5f803a886Beb2492eF3307EC0Ee16FB", // Credible Payfi Vault
  ],
  ethereum: [
    "0xA5cDEE01aA7A5E0620df5f27F26E552fdf7f5F20", // Byzanlink SyrupUSDC Vault
  ],
}

const solanaTokenAccounts = [
  'H77JK9eoCRPyEty5yXkm6hXMadn6isfYmDqaB3t5m4RM',
  'EjwW5YHMCdHcymXw3awB3dVrcda6y2PKUfsqUkEsN6RK',
]

module.exports = {
  methodology: 'Total value of assets deposited in the Byzanlink vaults, read on-chain and valued in USD.',
  solana: { tvl: sumTokensExport({ tokenAccounts: solanaTokenAccounts }) },
}

Object.keys(vaults).forEach(chain => {
  module.exports[chain] = { tvl: sumERC4626VaultsExport2({ vaults: vaults[chain] }) }
})
