const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0x09b1806df13062b5f653beda6998972cabcf7009',
        '0x0c78fd926a8fc9cfc682bdc6b411942d9c7edb7a',
        '0x0feabb61f67e859811aafce83a5ab780f8c53c0a',
        '0x33fe5557e90a872a065f2acfd973847e33fc4532',
        '0x6f531cf07f2d659dcfb371b1a7f4c0157a168332',
        '0x71467da4c0b0db4e889da703e6ff1cd740f1f74a',
        '0x7ac724cac6e4ddc24c102b1006f41bc8a6a5c1c5',
        '0x7e0616656934a09373b1e1114de2c20a77513d16',
        '0x80b62f0ea7a89bbc4df4c95e2ad363e5c153b80e',
        '0x823c8e533657b0004b5ab8553d84502ba2e571f7',
        '0x833f3b6faa717079fb3a1030f6207c57b1c591bd',
        '0x9f1bb5349d481065561a84cbd7f84982fd533359',
        '0xA310b3eecA53B9C115af529faF92Bb5ca4B41494',
        '0xa4E71851A8c8eaeFeb20A994159F4A443E46059b',
        '0xbe921ea3bd0c879a8688b7fabe6b3c8a471df90d',
        '0xc3edbb9c181016cef5d76491f835930e9c8c4d2c',
        '0xdd9c649edb7ff80c6c9d238344260184a4f94b88',
        '0xfb65377800a7282cf81baf0f335fbc6f8ff36776',
        '0x0ce7eefb9f862aa0374ee7bbc4d8a0fc2c651517',
        '0x0ce92d3a15908b53371ff1afcae800f28142250c',
        '0x95ad8841376058a000F489196F05ecf176bEB8ac',
        '0x0B3c7bcE764E6f1B52443e30fcb4f34997A0674c',
    ],
  },
  bsc: {
    owners: [
        '0x1349907c197731c5ed98d8442309a15107cb6bad',
        '0x2161217d22fac0188775432f8ba32f1d4272dd19',
        '0x3dd878a95dcaef2800cd57bb065b5e8f2f438131',
        '0x46c75fc52e0263946f8f1a75a95c23a767d2f26e',
        '0x6e2673095545280f6f10e22eb861a555c6e94bec',
        '0x84457412efe8b3a05583cb496e1d2c03e6f36155',
        '0x8458c828d602230e92eb0aac5a6aed5580011b6a',
        '0xA310b3eecA53B9C115af529faF92Bb5ca4B41494',
        '0xa4E71851A8c8eaeFeb20A994159F4A443E46059b',
        '0xc6acb77befebff0359cc581973859eee8cbaeda1',
        '0xd666ad8d95903bce9b4dcd2cacde5145e36405c2',
        '0xd7aed730a7c4cf8dfe313b16712af3406f6dca5b',
        '0x6db133e840376555a5ad5c1d7616872ef57e7f13',
        '0xDCa6951B82e82AF6AAB4bB9e90CA00F5760370e1',
    ]
  },
  tron: {
    owners: [
        // 'TArBsHHp4zz1TWgHhZWvNcxD4A7DMbcoMm',
        'TAv486fty6xRuWHQfhBiMh4jBofSuXJcpV',
        // 'TBqiQviC27UdWU58qbviJKJwp9b3DygLpY',
        'TDQ7nxDTJBMZkkWcFZKs9KdWzb2vT2drDu',
        'TKCbzA6HPnwEDL9M2tAWnqsbD6TXLUD7yy',
        // 'TLHuz1191oCESWJH6sAq9MS5w66HtHVbyc',
        'TLqPRfPHieHsMMFaQSMXoXqWD18C97cFqB',
        // 'TNoQvaDoPHcdoux2Ymt3yUnsSGJgLSXygo',
        'TSFvf8LZuwy4BKNPdULFD5vaCFMrkiGRme',
        // 'TTNeMfGyAL1Bb8vw32U8hxJ5Vmju5tsQ8y',
        // 'TUTh7mS9o2EPgxLbx2bNSwwyoPCsLUmkNq',
        // 'TUXjobUdiUPvSZmbBVWTcSEqoXzFNr4ZDa',
        // 'TUrk8EeZgKCQkfd1KhAfRMBmH1Y4NYnaaL',
        'TW6DLBY5dyCUVzc3sgKV72HXNT8EkmEUT8',
        // 'TX39NXuXviJ1be8y1XkbnQ4DfFmp9gRhez',
        'TXiZ9ddXTBUke9PDs5HLXVvvHY68kmC3me',
        // 'TYp46EYRTHb2grSfjkDFFtakcgedXBHEhh',
        // 'TYshj25EXjnPB7P5xRGLmFTNPV6HMoZyrq',
        // 'TUiATx1SGs3TwwKY1atafMvYjrQD8KLiSk',
    ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.maskex
  }
}

module.exports = cexExports(config)