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
  if (!(lbtcBackingInBTC > 0)) throw new Error(`lombard-btcb: bad staking vault balance: ${data?.balance}`)
  
  // vault base balance is a subset of the deposit addresses, so a gross below it means a short read
  // (equality is legitimate: it just means every deposited sat backs LBTC and this adapter nets to 0)
  if (!(balances.bitcoin >= lbtcBackingInBTC))
    throw new Error(`lombard-btcb: gross ${balances.bitcoin} BTC below LBTC backing ${lbtcBackingInBTC} BTC`)

  balances.bitcoin = balances.bitcoin - lbtcBackingInBTC

  return balances
}

module.exports = {
  methodology: 'BTC.b is a 1:1 representation of Bitcoin, redeemable for native BTC. TVL counts the native BTC in Lombard and Avalanche BTC.b deposit addresses, minus the LBTC staking vault base balance reported by the Lombard ledger, since that portion is counted by the lombard adapter.',
  doublecounted: true,
  timetravel: false,
  isHeavyProtocol: true,
  bitcoin: { tvl }
}

module.exports.hallmarks = [
  ['2025-10-30', 'Lombard has acquired BTC.b'],  //2025-10-30
]