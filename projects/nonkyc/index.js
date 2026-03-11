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
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7',
      '0x9a1Dfd705130ef60245d6FC798411f296f641119'
    ]
  },
  avax: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7',
      '0x9a1Dfd705130ef60245d6FC798411f296f641119'
    ]
  },
  base: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7',
      '0x9a1Dfd705130ef60245d6FC798411f296f641119'
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
      '0x15d7619c8457e2F89ea28c720b1d7941C245d27e',
      '0x473ba7D925b147024Ff5F6b19eC802DbB54E8acf'
    ]
  },
  cardano: {
    owners: [
      'addr1qy77lfdhpnxyl90t58amp2x3dz0lhgzttmw53g2nxe360x7aht5vw4djzh7jluu6jrl384l6u628ymh4yghgnfgk3kqsjymy5j'
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
      '0x7b4D11b7fABC161bc09E3Ee86C3d34Dff40F5a47',
      '0x2024a4A6a3f1eC6FC61AA62E3f801ea59962304F'
    ]
  },
  ethereum: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7',
      '0x9a1Dfd705130ef60245d6FC798411f296f641119'
    ],
  },
   /*
  ethereumclassic: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7'
    ],
  }, //we dont support ethclassic on CEX dashboard
  */
  flare: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7',
      '0x9a1Dfd705130ef60245d6FC798411f296f641119'
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
      'ltc1qmjzuyy3yljdqt8x4da3kwngzzek5j3gcqttmum'
    ],
  },
  optimism: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7',
      '0x9a1Dfd705130ef60245d6FC798411f296f641119'
    ],
  },
  polygon: {
    owners: [
      '0xA785844dF37E04d89D0Ae8F036e13630ad6495e8',
      '0x66Ef5728f5a26C8DF12168a114c09a64E5Bb5461'
    ]
  },
  ripple: {
    owners: [
      'rB4kDPaivX4YqWHHj2VERfAzZJTys27g5G'
    ]
  },
  sonic: {
    owners: [
      '0x5D738fBf1D8940BBE72Af847d88c517064DE76e7',
      '0x9a1Dfd705130ef60245d6FC798411f296f641119'
    ],
  },
  tron: {
    owners: [
        'TRQ2XkdQEkhd6epVA7qPod6QXxea25Js53'
    ]
  },  
}

module.exports = cexExports(config)
module.exports.methodology = 'All reserves information can be found here https://nonkyc.io/allreserves. Addresses with less than $10 value in assets are not tracked.'
