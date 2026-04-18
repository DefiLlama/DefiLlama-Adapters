const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

// https://support.bitmart.com/hc/en-us/articles/18473693031451-Enhancing-Transparency-and-Trust-at-BitMart
const owners = [
'0x328130164d0f2b9d7a52edc73b3632e713ff0ec6',
'0xeacb50a28630a4c44a884158ee85cbc10d2b3f10',
'0x3ab28ecedea6cdb6feed398e93ae8c7b316b1182',
'0x7563758243a262e96880f178aee7817dcf47ab0f',
'0x6D0D19bddDC5ED1dD501430c9621DD37ebd9062d',
'0x2982bB64bcd07Ac3315C32Cb2BB7e5E8a2De7d67',
'0x7563758243A262E96880F178aeE7817DcF47Ab0f',
'0x6D0D19bddDC5ED1dD501430c9621DD37ebd9062d',
'0xa23EF2319bA4C933eBfDbA80c332664A6Cb13F1A',
]
const config = {
  ethereum: {
    owners
  },
  bsc: {
    owners
  },
  solana: {
    owners: ['CgANddXc7FKSsdLSdFv67X8faZqQaRTeLMXkAVANkZD4']
  },
  bitcoin: {
    owners: bitcoinAddressBook.bitmark
  },
  starknet: {
    owners: ['0x04de639e634c071c3ce8b1c69fac0500aab5ddb25a08fd0f757176243e4c0467']
  },
}

module.exports = cexExports(config)
