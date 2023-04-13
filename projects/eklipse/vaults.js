module.exports = [
  {
    id: 'kDAI_kUSDT_kUSDC',
    name: '3Moon',
    tvName: 'threemoon',
    pid: 0,
    lpAddress: '0x4F5d9F3b17988aA047e6F1Bc511fEc0BF25691f4',
    lpTokenAddress: '0xd83b9dFa49D6C6d2A69554576e712E45A8A13E49',
    lpTokenDecimal: 18,
    farmAddress: '0xCeAAF9f6C8147B2A7Cd8bD4E9fA8955b430Eb423',
    tokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    tvlTokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    order: 0
  },
  {
    id: 'pUSD_3Moon',
    name: '3Moon-pUSD',
    tvName: 'pusd3moon',
    pid: 1,
    order: 1,
    lpAddress: '0xe59234EeDC854b3b37D48EFd8a529069C3990F83',
    lpTokenAddress: '0x63C7d72963ED6e0C255835B606BEF55EBEB1b5f8',
    lpTokenDecimal: 18,
    farmAddress: '0x0B9932F158509671f7A70b0FB45e58BCdC6fe083',
    tokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC',
      'pUSD'
    ],
    tvlTokenList: [
      '3Moon',
      'pUSD'
    ]
  },
  {
    id: 'kBUSD_3Moon',
    name: '3Moon-BUSD',
    tvName: 'busd3moon',
    pid: 2,
    order: 2,
    lpAddress: '0xddA06aaB425a1A390c131F790A56AB3380e3B7EC',
    lpTokenAddress: '0x9EE1cE4ccF4c0379e675d9A326d21aacDbB55F72',
    lpTokenDecimal: 18,
    farmAddress: '0x71143d3f2491c3956f3b4b8A329472af31963c51',
    tokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC',
      'kBUSD'
    ],
    tvlTokenList: [
      '3Moon',
      'kBUSD'
    ]
  },
  {
    id: 'KSD_3Moon',
    tvName: 'ksd3moon',
    name: '3Moon-KSD',
    tokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC',
      'KSD'
    ],
    tvlTokenList: [
      '3Moon',
      'KSD'
    ],
    lpAddress: '0x7f352a4332fAD433D381d700118f8C9b0A1E1abb',
    lpTokenAddress: '0xa4D48E724c7F2267918B5155094FB01437980604',
    lpTokenDecimal: 18,
    farmAddress: '0x1daD4757f1DE9e090724A39b765f154760E3f62A',
    pid: 3,
    order: 3
  },
  {
    id: 'KASH_3Moon',
    tvName: 'kash3moon',
    name: '3Moon-KASH',
    tokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC',
      'KASH'
    ],
    tvlTokenList: [
      '3Moon',
      'KASH'
    ],
    lpAddress: '0xB1b782f2D30505e9984e37e00C6494437d94c223',
    lpTokenAddress: '0x9D5b7671CdDbA4bb82E99fBcedf60C4D001Fe2EF',
    lpTokenDecimal: 18,
    farmAddress: '0x789fc46319e51D956b003f1F552E04F922dCB035',
    pid: 4,
    order: 4
  },
  {
    id: 'USDK_3Moon',
    tvName: 'usdk3moon',
    name: '3Moon-USDK',
    tokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC',
      'USDK'
    ],
    tvlTokenList: [
      '3Moon',
      'USDK'
    ],
    lpAddress: '0x75Dc33f8247245E8E08852E68E7f275E2a41fD40',
    lpTokenAddress: '0xc4ACf4ddd4838E9A727cCDb75ae62Af1706a7173',
    lpTokenDecimal: 18,
    farmAddress: '0x85338F94844673b636e632eb21575E1e21864cbc',
    pid: 5,
    order: 5
  },
  {
    id: 'd_kDAI_kUSDT_kUSDC',
    name: '3Moon',
    pid: 0,
    lpTokenDecimal: 18,
    lpAddress: '0x4F5d9F3b17988aA047e6F1Bc511fEc0BF25691f4',
    lpTokenAddress: '0xd83b9dFa49D6C6d2A69554576e712E45A8A13E49',
    farmAddress: '0xC322B6c5D35112bE004f02039D3e07d5AF0b95D6',
    tokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    tvlTokenList: [
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    isDeprecated: !0,
    deprecated: 'Deprecated',
    isFarmOnly: !0,
    order: 1
  },
  {
    id: 'd_kBUSD_3Moon',
    name: 'BUSD-3Moon',
    pid: 1,
    order: 2,
    lpTokenDecimal: 18,
    lpAddress: '0x323fdda29fa2B8028eF9Fb48c1D45e5A39214D9A',
    lpTokenAddress: '0x9f055b5fbde5d6e693752e489d3d71f04810b4d4',
    farmAddress: '0xC322B6c5D35112bE004f02039D3e07d5AF0b95D6',
    tokenList: [
      'kBUSD',
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    tvlTokenList: [
      'kBUSD',
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    deprecated: 'Deprecated',
    isDeprecated: !0
  },
  {
    id: 'd_KSD_3Moon',
    name: 'KSD-3Moon',
    tokenList: [
      'KSD',
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    tvlTokenList: [
      'KSD',
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    lpAddress: '0x5B4ed8321ea13047195104037798f29257EAc28c',
    lpTokenAddress: '0x72a35eb0d8a8d0301a5f92c9b6191bcb7ea232e0',
    farmAddress: '0xC322B6c5D35112bE004f02039D3e07d5AF0b95D6',
    lpTokenDecimal: 18,
    pid: 2,
    deprecated: 'Deprecated',
    isDeprecated: !0,
    order: 3
  },
  {
    id: 'd_KASH_3Moon',
    name: 'KASH-3Moon',
    tokenList: [
      'KASH',
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    tvlTokenList: [
      'KASH',
      'kDAI',
      'kUSDT',
      'kUSDC'
    ],
    lpAddress: '0x29c6Eb808020Ef4889A9f25d35b69edBAfB0C78e',
    lpTokenAddress: '0xC49Ba500A20B26D7A5407E22d7A7fC08E1E2f31A',
    farmAddress: '0xC322B6c5D35112bE004f02039D3e07d5AF0b95D6',
    lpTokenDecimal: 18,
    pid: 3,
    deprecated: 'Deprecated',
    isDeprecated: !0,
    order: 3
  }
]
