const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.cryptoCom,
  },
  ethereum: {
    owners: [
      '0x72a53cdbbcc1b9efa39c834a540550e23463aacb',
      '0x6262998ced04146fa42253a5c0af90ca02dfd2a3',
      '0xcffad3200574698b78f32232aa9d63eabd290703',
      '0x7758e507850da48cd47df1fb5f875c23e3340c50',
      '0x46340b20830761efd32832a74d7169b29feb9758',
      '0xf3b0073e3a7f747c7a38b36b805247b222c302a3',
    ],
  },
  bsc: {
    owners: [
              '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
              '0xcffad3200574698b78f32232aa9d63eabd290703',
              '0x7758e507850da48cd47df1fb5f875c23e3340c50',
              '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  polygon: {
    owners: [
              '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
              '0xcffad3200574698b78f32232aa9d63eabd290703',
              '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
              '0x7758e507850da48cd47df1fb5f875c23e3340c50',
              '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  arbitrum: {
    owners: [
              '0xcffad3200574698b78f32232aa9d63eabd290703',
              '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
              '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
              '0x7758e507850da48cd47df1fb5f875c23e3340c50',
              '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  avax: {
    owners: [
               '0xcffad3200574698b78f32232aa9d63eabd290703',
               '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
               '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
               '0x7758e507850da48cd47df1fb5f875c23e3340c50',
               '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  optimism: {
    owners: [
               '0xcffad3200574698b78f32232aa9d63eabd290703',
               '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
               '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
               '0x7758e507850da48cd47df1fb5f875c23e3340c50',
               '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  },
  fantom: {
    owners: [
              '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3',
              '0x72A53cDBBcc1b9efa39c834A540550e23463AAcB',
              '0x7758e507850da48cd47df1fb5f875c23e3340c50',
              '0xcffad3200574698b78f32232aa9d63eabd290703'
            ]
  }
}

module.exports = cexExports(config)
