const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  /*
  alephium: {
    owners: [
      '1DiovRDAHyYJTudaTEhccZaGMTSCFtJ3NxvNGFWkXnCSJ'
    ]
  },
*/ //we dont support alephium on CEX dashboard
  algorand: {
    owners: [
      '26NEOQ2ZVVM6C53LVFC7MUNA32HF4S2DCZT5JZ5SDSKTN4OOMA7VMIRZVA'
    ]
  },
  arbitrum: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ]
  },
  avax: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ]
  },
  base: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ]
  },
  /*
  bitcoin: {
    owners: bitcoinAddressBook.nonkyc
  }, // remove it for now
    /*
  bitcoincash: {
    owners: [
      'qzfew0ck3kxjdytrr2vnycdjnnsyju3pwsrgsupqj2',
    ]
  },
  */ // we dont support bitcoincash on CEX dashboard
  bsc: {
    owners: [
      '0x15d7619c8457e2F89ea28c720b1d7941C245d27e'
    ]
  },
  cardano: {
    owners: [
      'addr1qxd9jjmxd4gl2kf4jh99nnhqjsk5gn597ryq25045ttaschx70mgasdwgef63zgwl0fac38mdwaszwsg7uu0d2j5ckqsgsva7r'
    ]
  },
  /*
  dash: {
    owners: [
      'XauVSyTHwQiwt5HLiMKEYhCZr9z4dwzyn4'
    ]
  }, //// we dont support dash neither doge on CEX dashboard
  doge: {
    owners: [
      'DFbKm2cjt1Y36sKPQc6RQc3MsLmwcccTJx'
    ]
  },
   */
  energi: {
    owners: [
      '0x7b4D11b7fABC161bc09E3Ee86C3d34Dff40F5a47'
    ]
  },
  ethereum: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ],
  },
   /*
  ethereumclassic: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ],
  }, //we dont support ethclassic on CEX dashboard
  */
  fantom: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ],
  },
  flare: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ],
  },
  /*
  fusion: {
    owners: [
      '0x7b4D11b7fABC161bc09E3Ee86C3d34Dff40F5a47'
    ],
  }, // no support on CEX
  */
  litecoin: {
    owners: [
      'ltc1qemulmneuu7lv3z9a00v243u23dt0vygcq6cwp7'
    ],
  },
  optimism: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ],
  },
  polygon: {
    owners: [
      '0xA785844dF37E04d89D0Ae8F036e13630ad6495e8'
    ]
  },
  ripple: {
    owners: [
      'rHmku65GJrrsp6Sb7KRzCgM2tAA3JBACQZ'
    ]
  },
  tron: {
    owners: [
        'TAEbfGoPFxpW8QSBMnce1snm9om3QwH6rU'
    ]
  },  
}

module.exports = cexExports(config)
module.exports.methodology = 'All reserves information can be found here https://nonkyc.io/allreserves. Addresses with less than $10 value in assets are not tracked.'