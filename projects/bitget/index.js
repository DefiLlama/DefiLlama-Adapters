const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bsc: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x149ded7438caf5e5bfdc507a6c25436214d445e1',
        '0x3a7d1a8c3a8dc9d48a68e628432198a2ead4917c',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689'
    ],
  },
  ethereum: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x1Ae3739E17d8500F2b2D80086ed092596A116E0b',
        '0x2bf7494111a59bD51f731DCd4873D7d71F8feEEC',
        '0x31a36512d4903635b7dd6828a934c3915a5809be',
        '0x461f6dCdd5Be42D41FE71611154279d87c06B406',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689',
        '0x9E00816F61a709fa124D36664Cd7b6f14c13eE05',
        '0xdFE4B89cf009BFfa33D9BCA1f19694FC2d4d943d',
        '0xe2b406ec9227143a8830229eeb3eb6e24b5c60be',
        '0xe6a421f24d330967a3af2f4cdb5c34067e7e4d75',
        '0xe80623a9d41f2f05780d9cd9cea0f797fd53062a',
        '0xf646d9B7d20BABE204a89235774248BA18086dae',
        '0x1d5ba5414f2983212e03bf7725add9eb4cdb00dc',  //add on 12/01/2024
        '0x51971c86b04516062c1e708cdc048cb04fbe959f',  //add on 12/01/2024
        '0x5051e9860c1889eb1bfa394365364b3dd61787f1',  //add on 12/01/2024
        '0x731309e453972598ea05d706c6ee6c3c21ab4d2a',  //add on 12/01/2024
        '0x842ea89f73add9e4fe963ae7929fdc1e80acdb52',  //add on 12/01/2024
        '0x1a96e5da1315efcf9b75100f5757d5e8b76abb0c',  //add on 12/01/2024
        '0x4dfc15890972ecea7a213bda2b478dabc382e7a1',  //add on 12/01/2024
        '0x70213959a644baa94840bbfb4129550bceceb3c2',  // add on 27/05/2024
        '0x54a679e853281a440911f72eae0e24107e9413dc',  // add on 27/05/2024
        '0x1ab4973a48dc892cd9971ece8e01dcc7688f8f23', // add on 27/05/2024
        '0x0edd5b0de0fe748be331186bf0aa878f47f601db', // add on 27/05/2024
        '0x4121217c238db06e942f3d87371106d30d0f8c84', // add on 27/05/2024
        '0xed470553f61f23cd30ccf51ab066dc1598ed0c4f', // add on 27/05/2024
        '0x59708733fbbf64378d9293ec56b977c011a08fd2', // add on 27/05/2024
        '0xaab0039de2a8dba8696ee4d42c0d1aa30d7e1059', // add on 27/05/2024
        '0xf207b2f9f9417fc73cad069f7aa5ae1c6a5b428d', // add on 27/05/2024
        '0x4d216d2682f3997f6c19420beee4530d08d0ea5f', // add on 27/05/2024
        '0xdbe46a02322e636b92296954637e1d7db9d5ed26', // add on 27/05/2024
    ]
  },
  tron: {
    owners: [
        'TAa8e7U7seCy7NcZ52xYVQXXybFfwvsUxz',
        'TBXEdr2pD1tszUNAkVX18K7nie1MptkZ1y',
        'TBytnmJqL47n8bAP2NgPWfboXCwEUfEayv',
        'TFrRVZFoHty7scd2a1q6BDxPU5fyqiB4iR',
        'TGJagVsVg9QSePG5GreotgdefgaXPRo8SH',
        'TGZ959FTLRk8droUqDNgLxML1X9mEVej8q',
        'TYiQTHtgLo6KX6hYgbKLJsTbWK5hu9X5MG',
        'TZHW3PJe6VoyV8NWAaeukqWNRe3bVU7u8n',
        'TBM2FK4KBEEsMVYjm4WAW2Q8Es2NKdmUB8', //add on 12/01/2024
        'TCvfZC9h6fFXnF7KbHPgY4jgfen93VkfVW', //add on 12/01/2024
        'TGp7SNzjrctsWNwaFFN2PNTh3b1Kgxdtib', //add on 12/01/2024
        'TBpo1Sh7vKCLrfxocZHd8CA5wc2R75kSJM', // add on 27/05/2024
        'TMauqkA78pfysSTn8jD1dvEUkjme2gEEdn', // add on 27/05/2024
        'TKPqvBMU2v23RyjjViKvp16kiHPx7FnrHQ', // add on 27/05/2024
        'TVSdtELybCCa9DPDH15CMAPjeRcENAmDJZ', // add on 27/05/2024
    ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.bitget
  },
  arbitrum: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef', //add on 12/01/2024
    ]
  },
  optimism: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689'
    ]
  },
  era: {
    owners: [
      '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689'
    ]
  },
  fantom :{
    owners: ['0x5bdf85216ec1e38d6458c870992a69e38e03f7ef']
  },
  cronos: {
    owners: ['0x0639556F03714A74a5fEEaF5736a4A64fF70D206']
  },
  avax: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef'
    ]
  },
  polygon: {
    owners: [
        '0x0639556F03714A74a5fEEaF5736a4A64fF70D206',
        '0x5bdf85216ec1e38d6458c870992a69e38e03f7ef',
        '0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689'
    ]
  },
  ripple: {
    owners: [
        'r3AEihLNr81VYUf5PdfH5wLPqtJJyJs6yY',
        'rGDreBvnHrX1get7na3J4oowN19ny4GzFn'
    ]
  },
  solana: {
    owners: ['A77HErqtfN1hLLpvZ9pCtu66FEtM8BveoaKbbMoZ4RiR']
  },
  metis: {
    owners: ['0x5bdf85216ec1e38d6458c870992a69e38e03f7ef']
  },
  kava: {
    owners: ['0x97b9d2102a9a65a26e1ee82d59e42d1b73b68689']
  },
  starknet: {
    owners: ['0x0299b9008e2d3fa88de6d06781fc9f32f601b2626cb0efa8e8c19f2b17837ed1']
  },
}

module.exports = cexExports(config)