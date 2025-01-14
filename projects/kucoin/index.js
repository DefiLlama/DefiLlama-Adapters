const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
      '0x061f7937b7b2bc7596539959804f86538b6368dc',
      '0x1692e170361cefd1eb7240ec13d048fd9af6d667',
      '0x41e29c02713929f800419abe5770faa8a5b4dadc',
      '0x441454b3d857fe365b7defe8cb3e4f498ec91eac',
      '0x446b86a33e2a438f569b15855189e3da28d027ba',
      '0x45300136662dd4e58fc0df61e6290dffd992b785',
      '0x58edf78281334335effa23101bbe3371b6a36a51',
      '0x738cf6903e6c4e699d1c2dd9ab8b67fcdb3121ea',
      '0x7491f26a0fcb459111b3a1db2fbfc4035d096933',
      '0x77f59b595cac829575e262b4c8bbcb17abadb33a',
      '0x7b915c27a0ed48e2ce726ee40f20b2bf8a88a1b3',
      '0x83c41363cbee0081dab75cb841fa24f3db46627e',
      '0x88bd4d3e2997371bceefe8d9386c6b5b4de60346',
      '0x9f4cf329f4cf376b7aded854d6054859dd102a2a',
      '0xa152f8bb749c55e9943a3a0a3111d18ee2b3f94e',
      '0xa649ffc455ac7c5acc1bc35726fce54e25eb59f9',
      '0xaa99fc695eb1bbfb359fbad718c7c6dafc03a839',
      '0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23',
      '0xcad621da75a66c7a8f4ff86d30a2bf981bfc8fdd',
      '0xce0d2213a0eaff4176d90b39879b7b4f870fa428',
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
      '0xd89350284c7732163765b23338f2ff27449e0bf5',
      '0xd91efec7e42f80156d1d9f660a69847188950747',
      '0xec30d02f10353f8efc9601371f56e808751f396f',
      '0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91',
      '0xf8da05c625a6e601281110cba52b156e714e1dc2',
      '0xf97deb1c0bb4536ff16617d29e5f4b340fe231df'
    ],
  },
  tron: {
    owners: [
      'TEWzF5ZsaWMh6sTNDPrYaPJrK8TTMGfwCC',
      'TQeNNo5zVarhdKm5EiJSekfNXg6H1tRN4n',
      'TRYL7PKCG4b4xRCM554Q5J6o8f1UjUmfnY',
      'TSGEXDSRMtzt9swPSgzr8MKefcgEawEdmb',
      'TUpHuDkiCCmwaTZBHZvQdwWzGNm5t8J2b9'
    ]
  },
  bitcoin: {
    owners: bitcoinAddressBook.kucoin
  },
  arbitrum: {
    owners: [
      '0x00f3e09abe73aec2d6ad7b8820049b60ebc73f94',
      '0x03e6fa590cadcf15a38e86158e9b3d06ff3399ba',
      '0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23',
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
      '0xf3f094484ec6901ffc9681bcb808b96bafd0b8a8',
    ],
  },
  algorand: {
    owners: [ // added on 23/03/24
               '2X2GV36S66B64URLMRZ4O4IGLWSM5MEKIE6J5VREIZC62GVKCSH25IG4PM',
               'IMGMVBZEPMM36AIMWI7FZHG2G44KEESC5ALZHWX7B7SBNBDY6Z7COYMO6U',
               'NDVDIGWEP77WQDDU5M6F7AAS77AOFXLML7DNNPUEVLQMKTIFHYTTMAG6OU',
               'WBI5LT2BQ7FFYBXW2PEDVB6KBX2F3C77WXBJ2FPVERBXXBUV6SC7XXPGWM',
               'YXDKDH5XHXL6OYMH2HYCJCXOZWPOBEUNK5ICFVJRFW3JVQXZ6HQ6QPVQVA',
           ],
  },
  kcc: {
    owners: [
      '0x14ea40648fc8c1781d19363f5b9cc9a877ac2469',
      '0x2a8c8b09bd77c13980495a959b26c1305166a57f',
      '0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23',
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
    ],
  },
  eos: {
    owners: ['qlwzviixzm1h', 'kucoinrise11', 'kucoinatwarm'],
  },
  optimism: {
    owners: [
      '0xa3f45e619cE3AAe2Fa5f8244439a66B203b78bCc',
      '0xebb8ea128bbdff9a1780a4902a9380022371d466',
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
    ],
  },
  solana: {
    owners: [
      'BmFdpraQhkiDQE6SnfG5omcA1VwzqfXrwtNYBwWTymy6',
      'EkUy8BB574iEVAQE9dywEiMhp9f2mFBuFu6TBKAkQxFY',
      'HVh6wHNBAsG3pq1Bj5oCzRjoWKVogEDHwUHkRz3ekFgt',
    ],
  },
  bsc: {
    owners: [
      '0x1692e170361cefd1eb7240ec13d048fd9af6d667',
      '0x17a30350771d02409046a683b18fe1c13ccfc4a8',
      '0x3ad7d43702bc2177cc9ec655b6ee724136891ef4',
      '0x53f78a071d04224b8e254e243fffc6d9f2f3fa23',
      '0xb8e6d31e7b212b2b7250ee9c26c56cebbfbe6b23',
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
      '0xf8ba3ec49212ca45325a2335a8ab1279770df6c0',
    ],
  },
  kava: {
    owners: [
      '0x1dd9319a115d36bd0f71c276844f67171678e17b',
      '0xd6216fc19db775df9774a6e33526131da7d19a2c',
      '0xfb6a733bf7ec9ce047c1c5199f18401052eb062d',
    ],
  },
  starknet: {
    owners: [
      '0x0566ec9d06c79b1ca32970519715a27f066e76fac8971bbd21b96a50db826d90'
    ],
  }
}

module.exports = cexExports(config)
