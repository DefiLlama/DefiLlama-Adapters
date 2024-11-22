const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')


const config = {
  bitcoin: {
    owners: bitcoinAddressBook.bingCex
  },
  arbitrum: {
    owners: [
      '0xd3D3a295bE556Cf8cef2a7FF4cda23D22c4627E8',
    ]
  },
  bsc: {
    owners: [
      '0xd3D3a295bE556Cf8cef2a7FF4cda23D22c4627E8',
    ]
  },
  ethereum: {
    owners: [
      '0xd3D3a295bE556Cf8cef2a7FF4cda23D22c4627E8',
      '0x909C1c195FC0a31758C7169B321B707C9F44886B',
      '0xF7b7775f6D31eC2d14984f1cA3e736F5FB896DA2',
      '0xAd8E5cEb7D77e10403Be8430717c515273c31b8d',
      '0x74E7Fd0b532f88cf8cC50922F7a8f51e3F320Fa7',
      '0xA1195F0d9B010F86633E1553F1286d74F80eF52B',
    ]
  },
  tron: {
    owners: [
      'TC8WxPjG7VDdeCK2FriRZwiPTFBayS9PHy',
      'TB1xcvdYDgWwqzCvVJV6mKxSdjjq8pvwRn',
      'TSCC14Y9nxdL4kLfbqwaUw2rX32n1sUpzB'
    ]
  },
  ripple: {
    owners: [
      'rsbENGVE1pXuM6AQT3VQweLhYdsxR6ZESj'
    ]
  },
}

module.exports = cexExports(config)