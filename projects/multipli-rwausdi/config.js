'use strict'

module.exports = {
  ethereum: {
    token: '0xA39986F96B80d04e8d7AeAaF47175F47C23FD0f4',
    excludedHolders: [],
  },
  base: {
    token: '0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009',
    excludedHolders: [],
    reviewOnlyWrappers: [
      '0xed5AA9b6eb62298492c7246FE724ee088A760155',
    ],
  },
  monad: {
    token: '0x650b616b46Ff94000Eb115926aB8393B90788D76',
    excludedHolders: [],
    chainlink: {
      nav: 'https://data.chain.link/feeds/monad/monad/rwausdi-nav',
      por: 'https://data.chain.link/feeds/monad/monad/rwausdi-por',
    },
  },
  arbitrum: {
    token: '0xA39986F96B80d04e8d7AeAaF47175F47C23FD0f4',
    excludedHolders: [],
  },
}
