const { sumTokens } = require('../helper/chain/bitcoin')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')
const { sumTokensExport } = require('../helper/unwrapLPs')
const axios = require('axios')

// Lombard protocol design requires mixed wallets for LBTC and BTC.b

async function tvl(api) {
  const lombardOwners = await bitcoinAddressBook.lombard()
  const avalancheOwners = bitcoinAddressBook.avalanche
  const allOwners = [...lombardOwners, ...avalancheOwners]
  
  const balances = await sumTokens({ owners: allOwners , forceCacheUse: false })
  
  const { data } = await axios.get('https://ledger-mainnet.lombard-fi.com:1317/lombard-finance/ledger/btcstaking/staking_vault_base_balance')
  const lbtcBackingBalance = data.balance
  const lbtcBackingInBTC = Number(lbtcBackingBalance) / 1e8
  
  if (balances.bitcoin) {
    balances.bitcoin = Math.min(balances.bitcoin, lbtcBackingInBTC)
  }  

  return balances
}

module.exports = {
  doublecounted:true,
  timetravel: false,
  isHeavyProtocol: true,
  bitcoin: { tvl },
  ethereum: { tvl: sumTokensExport({ owners: ['0x838f0c257ab27856ee9be57f776b186140834b58'], tokens: ['0xfe4ecd930a1282325aef8e946f17c0e25744de45'] })}
}