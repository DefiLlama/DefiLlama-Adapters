const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bsc: {
    owners: [
        '0xC7029E939075F48fa2D5953381660c7d01570171',
        '0xb18fbfe3d34fdc227eb4508cde437412b6233121',
        '0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1',
    ],
  },
  ethereum: {
    owners: [
               '0x562680a4dc50ed2f14d75bf31f494cfe0b8d10a1',
               '0xb18fbfe3d34fdc227eb4508cde437412b6233121',
               '0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1'
  ]
  },
  tron: {
    owners: [
               'TS9b9boewmB6tq874PnVZrKPf4NZw9qHPi',
               'TFPqi7KTRwi2tihwS5dp1QomHowp1x2f45',
            ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.hotbit
  },
  ripple: {
    owners: ['rJKBidE4Av6ZaFTBcAucZXCpU7QvNXyfpT']
  },
  arbitrum: {
    owners: [
               '0xd690a9DfD7e4B02898Cdd1a9E50eD1fd7D3d3442',
               '0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1',
               '0xb18fbfe3d34fdc227eb4508cde437412b6233121'
              ]
  },
  avax: {
    owners: [
              '0x6C2e8d4F73f6A129843d1b3D2ACAFF1DB22E3366',
              '0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1',
              '0xb18fbfe3d34fdc227eb4508cde437412b6233121'
            ]
  },
  polygon: {
    owners: [
              '0xb34ed85bc0b9da2fa3c5e5d2f4b24f8ee96ce4e9',
              '0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1',
              '0xb18fbfe3d34fdc227eb4508cde437412b6233121'
            ]
  },
  optimism: {
    owners: [
              '0xfa6cf22527d88270eea37f45af1808adbf3c1b17',
              '0xb18fbfe3d34fdc227eb4508cde437412b6233121',
              '0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1'
            
            ]
  },
  fantom: {
    owners: [
              '0xc62A0781934744E05927ceABB94a3043CdCfEA89',
              '0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1',
              '0xb18fbfe3d34fdc227eb4508cde437412b6233121'
             ]
  },
  eos:{
    owners: [
               'hotbitioeoss',
               'hotbitioeos2'
            ]
  },
  cronos: {
    owners: [
               '0x768f2a7ccdfde9ebdfd5cea8b635dd590cb3a3f1',
               '0x4b81c7Ff6912856AFBb40ACb32084A41F019B433',
               '0xb18fbfe3d34fdc227eb4508cde437412b6233121'
           ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'We have collect this wallets from Hotbit Team on the 14/12/22 and added more on the 09/02/2023. We are not counting money in defi Protocols. In this case around $3.1m in Curve (Ethereum chain), around $1.1m in Convex, $1.6m in BendDAO, $960k in PancakeSwap (BSC Chain), $650k in Beefy, $230K in AutoFarm. We are also not counting around $622km in the Telcoin (Polygon) and $516k in Sandbox. We are also not counting around $975k in Wonderland (Avax) and $385k on Homora V2. We are also not counting $624k in Alpaca Finance (Fantom). We may also not count a few small token balances and other small amounts in defi Protocols. This data was collected on 19/04/23'