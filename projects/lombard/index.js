const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { sumTokensExport } = require('../helper/unwrapLPs')
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
    balances.bitcoin = Math.min(balances.bitcoin, lbtcBackingInBTC)
  }

  return balances
}

module.exports = {
  methodology: 'LBTC is a yield-bearing Bitcoin asset, 1:1 backed by native bitcoin. TVL counts the native BTC in Lombard deposit addresses, capped at the LBTC staking vault base balance reported by the Lombard ledger, plus the LFBTC balance that stands in for the BTC deposit addresses excluded from the address book.',
  doublecounted: true,
  timetravel: false,
  isHeavyProtocol: true,
  bitcoin: { tvl },
  ethereum: { tvl: sumTokensExport({ owners: ['0x838f0c257ab27856ee9be57f776b186140834b58'], tokens: ['0xfe4ecd930a1282325aef8e946f17c0e25744de45'] })}
}
