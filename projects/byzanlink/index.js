const ADDRESSES = require('../helper/coreAssets.json')
const { sumERC4626VaultsExport2 } = require('../helper/erc4626')
const { sumTokens2 } = require('../helper/solana')

const vaultsByChain = {
  hedera: [
    { name: 'Credible Payfi Vault', address: '0x6b8dfA6aa5f803a886Beb2492eF3307EC0Ee16FB' },
  ],
  ethereum: [
    { name: 'Byzanlink SyrupUSDC Vault', address: '0xA5cDEE01aA7A5E0620df5f27F26E552fdf7f5F20' },
  ],
}

const solanaVault = {
  name: 'Credible Payfi Vault',
  tokenAccounts: [
    'H77JK9eoCRPyEty5yXkm6hXMadn6isfYmDqaB3t5m4RM',
    'EjwW5YHMCdHcymXw3awB3dVrcda6y2PKUfsqUkEsN6RK',
  ],
  payfiReceiptToken: 'EnGJvwX84JwV91Nzci5wrKFsxefwFtyFDJMaEi3wsbGz',
}

async function solanaTvl(api) {
  await sumTokens2({ api, tokenAccounts: solanaVault.tokenAccounts })
  const balances = api.getBalances()
  const receiptKey = `solana:${solanaVault.payfiReceiptToken}`
  if (balances[receiptKey]) {
    api.add(ADDRESSES.solana.USDC, balances[receiptKey])
    delete balances[receiptKey]
  }
}

module.exports = {
  methodology:
    'Total value of assets deposited in the Byzanlink vaults, read on-chain and valued in USD.',
  solana: { tvl: solanaTvl },
  ...Object.fromEntries(
    Object.entries(vaultsByChain).map(([chain, vaults]) => [
      chain,
      { tvl: sumERC4626VaultsExport2({ vaults: vaults.map((v) => v.address) }) },
    ])
  ),
}
