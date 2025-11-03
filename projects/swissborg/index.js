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
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
      '0x0926a7b610B9Fc2D1E3F09FcBa52Ba3BEDCFfd91',
      '0x49841B9bb1dc499B36C4F618bf8feAC85fDFE889',
      '0xaCA8FB892Ac27d2f84Fa78EDb32F3AD221538c3e',
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
      'rwh2r5ESARRSymmKhxhaXb8Eae7aTWvYwc',
      'r9EUpQ9E9u2FUa49AYHbdkagpRza75jWbN',
    ],
  },
  near: {
    owners: [
      'dc6b4c8821dbe652b763e3bfadfea548137b29b97408c8b411ad72acff94e63f',
      '1c0dc521827821f1695538ff9312df15f32837bbfe95bc937f9faaafd4125552',
      '9b23bfd45a028e7a28326007b221cf8bd8b288630dde5ca714a0524f4865db89',
      '034e29f9703726c1f7b955fa5f7b16f6293adec615f668a73bc3b3b0255392df',
      'c298ef5c3754dbcb6c23b481b514641f91d46845a256be4fd6ad742d5f3c251c',
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
      'DMe3ddj7awSR3LFC64rjmCPexsrSv33QAxFoJux4vGH3',
      'J6wLEPrT8Jd2NiNSJAQwxdK7FDtDssawsMtLqkZ5E1ZP',
      'EcGfuxwkM3ujBWaty5VW7H9mjJLd7LkY3m7nJZ6Sv7Sy',
      'C57RBagtGDYpTGxwG92gSKQ5ptQr4Wa9qz3yDBB6uu1B',
      'EbUkjPNjzcbjK3iELhZS6PpNCr62pUsE7VkUvNdQpEYB',
      'FQxGUUAX3BdFArA2XdvPcRHt4CmRMCw5wLt8F5uDXmwa',
      'EKtwdf5gFPb58WJPENcS8qqPRoAkEwDLHfHk2S2nbTnB',
    ],
  },
  polkadot: {
    owners: [
      '1xXbYy1V5Sc3EQZ76wmcWy4gXTSyLbzgdDNJtGT6jEcL2z7',
      '15Fg7p6pzLo6uinCFdsx3HTWdAx4vFt8nnw2E3JWHHwh9NCn',
      '15mENJiKxtbxE2PNcB8qTaatYKjFTN4kitEzZ5eiHFGW3DVU',
      '12xHzb3NT4e8MAWwJUGfhTD7R41Abyfa3NdYDGqqL3V64PLG',
      '157zgQi6M5tn8U2aRQNh5tG7rj9Lif76xPxJnmJcfmbCGsQ3',
    ],
  },
  cardano: {
    owners: [
      'addr1qxqut96hxv5zxmhcgspmnq9tuaf6xglvq6tdv8jm5zltatv5hnm8tps2jw73pherd4l9yuuetxlp6gkeufq5p6ftjswssk33fx',
      'addr1q9vrcmu4sr7yrspknu8gwrzgrs6wuh0e6pkk9tyz2clg9llt77jyl7422xv72h9mc9kmsgvajssj4a4cpsv07n4e5lpqkfe9ft',
      'addr1qyy6n8xnyzulrax4mt0d5kdy93qm43qg4wxy09dw6apdxpqzldjpstc72lsna3krj6damxt32gw9jllr4q3u7mhg7jhs5u7jhd',
      'addr1q8n8jmkaqfwnw9f6f6cwex5uv9vl606s9945qp2t2ffrzypdlx09ue7ha5jvmda4re0pexpl9pshqjx8a8eqfs0kya8qg8hsat',
      'addr1q9sea30p9wqy9ad2h3klpwhxudd45fvqfe5mqpcfdh8afycx8tzdkudm7udv9uvfz6epmqdnucud9jv6twpu338mqymqdcphs3',
      'addr1qy2muwyr7edegpw4ywn50jnzw7kkpxjw7rjsuf27ws668yswdttyth96zpsjwfuf6m9x2ccgwz0p0864uvavs3qtfkgsaa2jy3',
      'addr1qxfcqh0yylf0zan0s4c6a2pt5jkulryqjfjrn8vll253m3skcrtekcs32m5d3nqvrayrmngkv6zz5zkvtldrllprshzqk0z64f',
      'addr1qygcz8flfwuzwtqxk58chs8g5htsghxyk7ltkt4rlp0c4h98heedkjaf00sg4ec4lh9vlsw988d58t207a86jp00npvspv7zpu',
    ],
  },
  hedera: {
    owners: [
      '0.0.686122',
      '0.0.686123',
      '0.0.9167857',
      '0.0.9167915',
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
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
      '0x0926a7b610B9Fc2D1E3F09FcBa52Ba3BEDCFfd91',
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
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
      '0x0926a7b610B9Fc2D1E3F09FcBa52Ba3BEDCFfd91',
      '0x9483C76AB7dC91c958b98eAAf6cBcE33f70547D2',
    ]
  },
  polygon: {
    owners: [
      '0x87cbc48075d7aa1760Ac71C41e8Bc289b6A31F56',
      '0xcDE4c1b984F3F02f997ECfF9980B06316de2577d',
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
      '0x0926a7b610B9Fc2D1E3F09FcBa52Ba3BEDCFfd91',
    ]
  },
  moonbeam: {
    owners: [
      '0x87cbc48075d7aa1760Ac71C41e8Bc289b6A31F56',
      '0xFF4606bd3884554CDbDabd9B6e25E2faD4f6fc54',
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
    ]
  },
  cosmos: {
    owners: [
        'cosmos10dfzd2wpnpeuy2lgan35ah8dg5p4l298v0n8e8',
        'cosmos197v98nkhnxr54x45hrcagnu2rr2ckyn7dz37t6',
        'cosmos1trvqv850ft2p7ntewneevd690qde2uvt6dxvnp',
    ]
  },
  arbitrum: {
    owners: [
      '0x8F0d8b27bF808976Fa94f03e2230b4bca95bf3C4',
      '0x5509Be53b2dD0CD6fb8473B0EdA94e0a3059b73a',
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
      '0x0926a7b610B9Fc2D1E3F09FcBa52Ba3BEDCFfd91',
    ]
  },
  osmosis: {
    owners: [
      'osmo1h9sy6z5hnk5wjf6ds8w4syq0yqs706n9m6qlap',
      'osmo197v98nkhnxr54x45hrcagnu2rr2ckyn79ezwag',
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
  },
  optimism: {
    owners: [
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
      '0x0926a7b610B9Fc2D1E3F09FcBa52Ba3BEDCFfd91',
    ]
  },
  sonic: {
    owners: [
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
      '0x0926a7b610B9Fc2D1E3F09FcBa52Ba3BEDCFfd91',
    ]
  },
  sei: {
    owners: [
      '0x28cC933fecf280E720299b1258e8680355D8841F',
      '0x85AC393adDd65bcf6Ab0999F2a5c064E867F255f',
    ]
  },
  tron: {
    owners: [
      'TNLKi5Yqa6NoduyXxtveTCrATZQHaYbc2m',
      'TUiaMVXiyHAsRR5VEX51KCFGWsyUT7Avwv',
    ]
  },
  doge: {
    owners: [
      'D9sBdytmsS1adxvzFTwz94tkpsoqXU8TaM',
      'DUDrC5rjQsRz6eEZQrb6wzh9jmauh2JHpX',
    ]
  },
  injective: {
    owners: [
      'inj1xdalk5nsudad3vxnnf3t28w4qljfedlnu7pk5e',
      'inj105zqcfv3z9z79yhsfg8v6rql3huzhyfp0sana9',
    ]
  },
  celestia: {
    owners: [
      'celestia197v98nkhnxr54x45hrcagnu2rr2ckyn7ugqw3h',
      'celestia1trvqv850ft2p7ntewneevd690qde2uvtt8hufv',
    ]
  },
  ton: {
    owners: [
      'UQAvfvh141q7M2ZmPE6YCmTFQW6pdoUXVTGrM2YBpt4iqOBF',
      'UQDR4lFPsfCx4TdWKsFUmiPdrkpl6xEixZ3VTn474lZsGuTd',
      'UQCL3aiqqyo5FKgKJOscigFey15rouAz2ZrLOVBq6axIZslU',
    ]
  },
  stellar: {
    owners: [
      'GCKIWBENT6R6F47SATS6ICYE5I7SJGDRK3C4XAOWUDTUH3SBJ7LFF7PZ',
      'GDFA6BWULOHVY6IXT6OZWYK4IHQC7BPYVMUL3MPJTXCDLMPD6BWLOGXB',
    ]
  },
  algorand: {
    owners: [
      '2BNEJ7ZV2SDGRZ2JGXTSVWVIBK5FYKAERAWXXGYZ66TSWWGHWAPXJ52HAE',
    ]
  },
  chz: {
    owners: [
      '0x762DA64958BbF03bB206BF33C520a3846b6Cc93D',
    ]
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'The list of wallets can be found at https://github.com/SwissBorg/pub. We also publish monthly our Proof of Liabilities at https://swissborg.com/proof-of-liabilities/audits. The total assets do not take into account the assets in DeFi.'
