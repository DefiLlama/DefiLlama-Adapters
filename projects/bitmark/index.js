const { cexExports } = require('../helper/cex')

// https://support.bitmart.com/hc/en-us/articles/18473693031451-Enhancing-Transparency-and-Trust-at-BitMart
const owners = [
'0x328130164d0f2b9d7a52edc73b3632e713ff0ec6',
'0xeacb50a28630a4c44a884158ee85cbc10d2b3f10',
'0x3ab28ecedea6cdb6feed398e93ae8c7b316b1182',
'0x7563758243a262e96880f178aee7817dcf47ab0f',
'0x6D0D19bddDC5ED1dD501430c9621DD37ebd9062d']
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
    owners: ['37RJkdkzPXCMYSTq74berJYj9FmNn7wFP5']
  },
}

module.exports = cexExports(config)
