const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { getConfig } = require('../helper/cache')

// Lombard protocol design requires mixed wallets for LBTC(/lombard adapter) and BTC.b (/avalanche-btc adapter)

async function tvl(api) {
  const lombardOwners = await bitcoinAddressBook.lombard()
  const avalancheOwners = bitcoinAddressBook.avalanche
  const allOwners = [...lombardOwners, ...avalancheOwners]
  
  const balances = await sumTokens({ owners: allOwners, forceCacheUse: true })
  
  const data = await getConfig(
    'lombard-staking-vault', 
    'https://ledger-mainnet.lombard-fi.com:1317/lombard-finance/ledger/btcstaking/staking_vault_base_balance'
  )
  
  const lbtcBackingInBTC = Number(data.balance) / 1e8
  
  if (balances.bitcoin) {
    balances.bitcoin = balances.bitcoin - lbtcBackingInBTC
  }

  return balances
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  isHeavyProtocol: true,
  bitcoin: { tvl }
}

module.exports.hallmarks = [
  [1761782400, 'Lombard has acquired BTC.b'],  //2025-10-30
]