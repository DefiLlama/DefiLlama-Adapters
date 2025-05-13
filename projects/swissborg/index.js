const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

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
      '0x178Fb204c1ff2Ed7d0651C522A3a5B15480Eb76d',
      '0xFbA64167e4f091Ca625FA79aa6f83665856f8Bf2',
      '0x8F0d8b27bF808976Fa94f03e2230b4bca95bf3C4',
      '0xe2484A7Ac1b9Cb6D8E55fd00e129aB913172bea6',
      '0xdbe15F6573108B6736c70779C683Ca633c18aFe2',
      '0xa2E07DB4e92F66071Ca68984517972F5625AB325',
      '0xBb6CaCfCeA26e45D0ac8019e1Eb606440736b53e',
      '0x697A276401BadD8A9e37aEdd3DBF70b325f31268',
      '0x8a1feCFF181dD770206c0892E09B0243A495152b',
      '0x5eD60B7BFba654342C401f853B55B8dd82f90726',
      '0xa9a99C96e9fCCaC00a100e72A2C19eDe79458698',
      '0x52b37e6dB2Fe5bB2781355Ac397aE49C9Bd29275',
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.swissborg
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
      '8V51vSJGYssywpKHrZacT3bpFYoeA1oD7hdvi1imnrVa',
      'CxbHK9geAiCc6yBVT7PhXEMXzwP7BGh8VB1TgbDV3uLq',
      '3jvARuePRR6KpNAeYYGRQzs8W4VYsWWxe4BfoTSTZhUr',
      '281BKbWX8f9XqexpmFGTGcrAzPbFtoSiBjTHUkVHQmtv',
      'H9RCk9jQYX1bZ6HmjDAiD4r8GMgF8zpW9P1pacze7L9E',
      'F98pLYBStoB31WNTWGoQMNz3A6uwoneivaYVCAD7Gim1',
      '4GiXcDsHVtqBZyUZBW55UcfAAgDcCm2Peojhhc6T3BZb',
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
      'addr1qyy6n8xnyzulrax4mt0d5kdy93qm43qg4wxy09dw6apdxpqzldjpstc72lsna3krj6damxt32gw9jllr4q3u7mhg7jhs5u7jhd',
      'addr1q8n8jmkaqfwnw9f6f6cwex5uv9vl606s9945qp2t2ffrzypdlx09ue7ha5jvmda4re0pexpl9pshqjx8a8eqfs0kya8qg8hsat',
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
      '0xE8322f6234B6F1e6e3489600f8b1297aB3dE22ab',
    ]
  },
  avax: {
    owners: [
      '0x87cbc48075d7aa1760Ac71C41e8Bc289b6A31F56',
      '0xcDE4c1b984F3F02f997ECfF9980B06316de2577d',
      '0x7153D2ef9F14a6b1Bb2Ed822745f65E58d836C3F',
      '0xFF4606bd3884554CDbDabd9B6e25E2faD4f6fc54',
      '0x9531AA9883bF11f2a63d86caD7e826f37Acec3c4',
      '0x4DF0BCB425aac41795B40a2B5A563A6a3eC23B41',
      '0xC6A4e26E07a848F2AB180a455C211d38BF483E3E',
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
  },
  arbitrum: {
    owners: [
      '0x8F0d8b27bF808976Fa94f03e2230b4bca95bf3C4',
      '0x5509Be53b2dD0CD6fb8473B0EdA94e0a3059b73a',
    ]
  },
  osmosis: {
    owners: [
      'osmo1h9sy6z5hnk5wjf6ds8w4syq0yqs706n9m6qlap',
    ]
  },
  xdai: {
    owners: [
      '0x4c61Fad9b400A8a3E0BbD40C4D57cF05525BF87e',
    ]
  },
  berachain: {
    owners: [
      '0x2D6757CE162CccD3EfFc8044751aC174168242E5',
    ]
  }
}

module.exports = cexExports(config)
module.exports.methodology = 'The list of wallets can be found at https://github.com/SwissBorg/pub. We also publish monthly our Proof of Liabilities at https://swissborg.com/proof-of-liabilities/audits. The total assets do not take into account the assets in DeFi.'
