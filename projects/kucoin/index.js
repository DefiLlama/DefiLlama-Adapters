const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
      '0x2b5634c42055806a59e9107ed44d43c426e58258',
      '0x689c56aef474df92d44a1b70850f808488f9769c',
      '0xa1d8d972560c2f8144af871db508f0b0b10a3fbf',
      '0x4ad64983349c49defe8d7a4686202d24b25d0ce8',
      '0x1692e170361cefd1eb7240ec13d048fd9af6d667',
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
      '0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91',
      '0xcad621da75a66c7a8f4ff86d30a2bf981bfc8fdd',
      '0xd89350284c7732163765b23338f2ff27449e0bf5',
      '0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23',
      '0xec30d02f10353f8efc9601371f56e808751f396f',
      '0x88bd4d3e2997371bceefe8d9386c6b5b4de60346',
    ],
  },
  tron: {
    owners: [
      'TUpHuDkiCCmwaTZBHZvQdwWzGNm5t8J2b9',
      'TEWzF5ZsaWMh6sTNDPrYaPJrK8TTMGfwCC',
      'TQeNNo5zVarhdKm5EiJSekfNXg6H1tRN4n',
      'TRYL7PKCG4b4xRCM554Q5J6o8f1UjUmfnY',
    ]
  },
  bitcoin: {
    owners: [
      '38fJPq4dYGPoJizEUGCL9yWkqg73cJmC2n',
      'bc1q080rkmk3kj86pxvf5nkxecdrw6nrx3zzy9xl7q',
      'bc1q8yja3gw33ngd8aunmfr4hj820adc9nlsv0syvz',
      'bc1qgrxsrmrhsapvh9addyx6sh8j4rw0sn9xtur9uq',
    ]
  },
  arbitrum: {
    owners: [
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
      '0x03e6fa590cadcf15a38e86158e9b3d06ff3399ba',
      '0xf3f094484ec6901ffc9681bcb808b96bafd0b8a8',
    ],
  },
  algorand: {
    owners: ['T6MXHXMGXURKJ7AD5NCB4IYPLWXYXKKFLLO5KAPJ56GKS7BFXHNHOODZCM'],
  },
  kcc: {
    owners: [
      '0x2a8c8b09bd77c13980495a959b26c1305166a57f',
      '0x14ea40648fc8c1781d19363f5b9cc9a877ac2469',
      '0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23',
    ],
  },
  eos: {
    owners: ['qlwzviixzm1h', 'kucoinrise11'],
  },
  optimism: {
    owners: [
      '0xa3f45e619cE3AAe2Fa5f8244439a66B203b78bCc',
      '0xebb8ea128bbdff9a1780a4902a9380022371d466',
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
    ],
  }
}

module.exports = cexExports(config)
