const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
      '0x5770815B0c2a09A43C9E5AEcb7e2f3886075B605',
      '0x94596096320A6B4EaB43556AD1Ed8c4c3d51C9aA',
      '0x5cEDc1923c33B253aedf24bF038eeE6Cbbb68A6A',
      '0x42b86A269fb3d5368D880c519BadABa77eC00130',
      '0x87cbc48075d7aa1760Ac71C41e8Bc289b6A31F56',
      '0xcDE4c1b984F3F02f997ECfF9980B06316de2577d',
      '0x6cf9aa65ebad7028536e353393630e2340ca6049',
      '0x7153D2ef9F14a6b1Bb2Ed822745f65E58d836C3F',
      '0xff4606bd3884554cdbdabd9b6e25e2fad4f6fc54',
      '0x22bF0A4C4eff418b3306AbFeE20813D0b6E8Dc74',
      '0x11444C6389A26C8E41d7FD5CafBfCC511303b7d3',
      '0x67FE3293FC4e877F3CDc3F0ed93721a600f72BdE',
    ],
  },
  bitcoin: {
    owners: [
      '18DowXoMUQT5EU8zPTDTrq4hrwmi8ddCcc',
      'bc1qfu6su3qz4tn0et634mv7p090a0cgameq6rdvuc',
      'bc1qutkfwnuq4v0zdkenqt5vyuxlrmsezldzue5znc',
      '1Mgs8zLJ7JyngcNRUscayyPHnnYJpJS5x2',
      'bc1qc8ee9860cdnkyej0ag5hf49pcx7uvz89lkwpr9',
      '1JgXCkk3gjmgfgjT2vvnjpvqfvNNTFCRpM',
    ]
  },
  ripple: {
    owners: [
      'rfyE1wqH1YY3u6BcauQwYuoD13GVtJErXq',
      'rJCv19Du7VXqSuaYhaB3WpLRScTMpS7c52',
      'raFmDg78SG5AxPjXyRFnsy7zYujZGpJsVq',
    ],
  },
  near: {
    owners: [
      'dc6b4c8821dbe652b763e3bfadfea548137b29b97408c8b411ad72acff94e63f',
      '1c0dc521827821f1695538ff9312df15f32837bbfe95bc937f9faaafd4125552',
      '9b23bfd45a028e7a28326007b221cf8bd8b288630dde5ca714a0524f4865db89',
    ],
  },
  solana: {
    owners: [
      '2E1UKoiiZPwsp4vn6tUh5k61kG2UqYpT7oBrFaJUJXXd',
      '2XxP4kS2vfkiMvpLpGNxry3fPUYimsuAmSbqL1KnuwZ8',
      'Cet3t77x2BBVSmiEFm8ZPoDSngbpso2RuWPL79Ky7SpA',
      '9qoUcyhKSWMbk6tqGUYQUpeosPcdUnJszG4eQKwfe4gL',
      'Fe7SEekiKygziaEGKxsDsgLVzrCfNvVBvAYsaJBwFA8s',
    ],
  },
  polkadot: {
    owners: [
      '1xXbYy1V5Sc3EQZ76wmcWy4gXTSyLbzgdDNJtGT6jEcL2z7',
      '15Fg7p6pzLo6uinCFdsx3HTWdAx4vFt8nnw2E3JWHHwh9NCn',
      '15mENJiKxtbxE2PNcB8qTaatYKjFTN4kitEzZ5eiHFGW3DVU',
    ],
  },
  cardano: {
    owners: [
      'addr1qxqut96hxv5zxmhcgspmnq9tuaf6xglvq6tdv8jm5zltatv5hnm8tps2jw73pherd4l9yuuetxlp6gkeufq5p6ftjswssk33fx',
      'addr1q9vrcmu4sr7yrspknu8gwrzgrs6wuh0e6pkk9tyz2clg9llt77jyl7422xv72h9mc9kmsgvajssj4a4cpsv07n4e5lpqkfe9ft',
      'addr1qy9ffv7zmqtmenskcnvsxszhv6zsls8gkl339tc5d2c5davhg2p4nekj924whmlmczq3jkf22yt5wh3ml7f8g3mxud4ss6mwyd',
      'addr1qx2tzwkx4fjg8cg0htw27cje4029cmf2plsm3nws5qyky45njhmrzd25840eesfu6q33tzaqxtrqarfuqe9wpsc9ks0qea4lcq',
    ],
  },
  hedera: {
    owners: [
      '0.0.686122',
      '0.0.686123',
    ],
  },
  bsc: {
    owners: [
      '0x5770815B0c2a09A43C9E5AEcb7e2f3886075B605',
      '0x94596096320A6B4EaB43556AD1Ed8c4c3d51C9aA',
      '0x87cbc48075d7aa1760Ac71C41e8Bc289b6A31F56',
      '0xcDE4c1b984F3F02f997ECfF9980B06316de2577d',
      '0x7153D2ef9F14a6b1Bb2Ed822745f65E58d836C3F',
      '0xff4606bd3884554cdbdabd9b6e25e2fad4f6fc54',
    ]
  },
  avax: {
    owners: [
      '0x87cbc48075d7aa1760Ac71C41e8Bc289b6A31F56',
      '0xcDE4c1b984F3F02f997ECfF9980B06316de2577d',
      '0x7153D2ef9F14a6b1Bb2Ed822745f65E58d836C3F',
      '0xFF4606bd3884554CDbDabd9B6e25E2faD4f6fc54',
    ]
  },
  polygon: {
    owners: [
      '0x87cbc48075d7aa1760Ac71C41e8Bc289b6A31F56',
      '0xcDE4c1b984F3F02f997ECfF9980B06316de2577d',
    ]
  },
  moonbeam: {
    owners: [
      '0x87cbc48075d7aa1760Ac71C41e8Bc289b6A31F56',
      '0xFF4606bd3884554CDbDabd9B6e25E2faD4f6fc54',
    ]
  },
  cosmos: {
    owners: [
        'cosmos10dfzd2wpnpeuy2lgan35ah8dg5p4l298v0n8e8',
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'The list of wallets can be found at https://github.com/SwissBorg/pub. We also publish monthly our Proof of Liabilities at https://swissborg.com/proof-of-liabilities/audits.'