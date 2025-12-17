const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
      owners: bitcoinAddressBook.tothemoon
  },
  bsc: {
    owners: [
      '0xe8bbf1f79b7676dae17cf1b4c59ace5ff592cc90',
      '0x39d73b7ac122191d87ec006a022b604046d87da6',
      '0xda197f00e994229e07a0bd05bb1a8e24537e9dae',
      '0x21f8c4ce58393ab60ce56868585c196d79417e2d',
      '0x3d87026f2d9f2ef79c12169774f1bfabadc908b4',
      '0x3626a62af56946f19c5790efb4ff8cb240781040',
      '0x5030d735de7ba097766047d6573e98611dee8f66',
      '0x446b3adcbebfec21fc2c295a60df9bd8ea270821',
      '0x44fc451f8163ef63c151d579529d61262ae673de',
      '0xc61e3a3ae3282e0699cb25a748165efc5743ccde',
      '0x1b26277245b899b4df7ab3584d93de71bb18075e',
      '0xbb321d71c17603a3f28f6d2e59a6812a1d208fc2',
      '0x423ed6b416f1ce29c09666cd7047ad7856afac9b',
      '0x989d189fe5d15991c4726d1c5ecfc0c37df26db9',
      '0x489e0059ab37b3a0a99bd1126301be230fe1ea0b',
      '0xf867050ab5c0a4a529d23175c3eaecc62ceb4fa7',
      '0x2b6b0d140122236d9a31014f01e1d5290b8a5310',
      '0x27780c3bbd33ca49e7c9ef414890e6b0a6131600',
      '0xef03313a5741c6c7bBC3BDb2D2C114128820f742',

    ],
  },
  ethereum: {
    owners: [
      '0x446b3adcbebfec21fc2c295a60df9bd8ea270821',
      '0x8084dddd27949c84f3b5c3b67e5ff316f330c1ef',
      '0xe58a3ebde7063409c7286e3b462162e6e5bbfe0a',
      '0x58beafb3728cec95f890e9cc17067d15415bc732',
      '0xf21fd9bc864008173538e6080a2a29fb8c03819a',
      '0xe8b8ae4e9ac5f46234d9033ab25b4cdb081b49c4',
      '0x7277f84ea279ad4bf01321f827e4159de695ffd0',
      '0xdbb27c626fef770b35f8b3bd65045cc08fb549a9',
      '0xe1b19dd436098af66363cc2c6f7226af473e4d79',
      '0x5faa88cac6061279bac6e1f159e19fcac4adbcdc'
    ],
  },
  tron: {
    owners: [
      'TNkWwmfxc4vLC3JskjxXt7Dyjg1KwFkLJF',
      'TDSt6rGjQyKxAmnRekDjWQaz3gvMSQVbQV',
      'TB1GFq3GDunz8YU4Q4oyEfJBXaSi3JGZmd',
      'TKjVajc9yW1z4g3erXhAT4fvpoq4x2a3Hr',
      'TED2kukjqMv3sgwcXPa3dsF1tqZaZoCr77',
      'TFxiAjpxQ9eQPMbtn9k8RT624zH2usvFs1',
      'TPkezqv23o9bk9Zj9fuE4HSgSY3rSy9TXs',
      'THj4UJXjnC62f2jCeWo1B8G15dbcmCbaJL',
      'TJPyoUyaduFFqh3H7fnH5e92DC6nTs8vAg',

    ],
  },
  polygon: {
    owners: [
      '0xf9d64ea64866be80ad69342e25371009e79ea70d',
      '0x446b3adcbebfec21fc2c295a60df9bd8ea270821',
      '0x39d73b7ac122191d87ec006a022b604046d87da6',
      '0xe51d4427b0b306bbc24a927d8bd692e62e403742'
    ]
  },
  solana: {
    owners: [
      '9JXTEMVMHPghKX1LNrXjUJwGEmdh2TgQg1W7uskvRmiy'
    ]
  },
  arbitrum: {
    owners: [
      '0x237C8A1f3Dff219b316425a45cD5F569e9D63421',
      '0x8719aed24B151B2aE578FAB5c998D780f74F0CCE',
      '0xd3c4c2C5622c212dEC0205D632102a5c502949fD',
      '0xD13B840D92A582Bab0bB49E1289e54a417BE7076',
      '0x0C9BE095748eb105729AF05CEe083d3fdF1f00a9'
    ]
  },
  avax: {
    owners: [
      '0x5faa88cac6061279bac6e1f159e19fcac4adbcdc'
    ]
  },
  optimism: {
    owners: [
      '0x1169214BB47e0C747332373d906E90D49387a689'
    ]
  },
  ton: {
    owners: [
      'UQDGmv55AmhYEFvGbQgIB6lhV6RcnvhQ2jQnhF_U3OljAjvp',
      'UQB2ZU10TySARxMlPbKL_R50u92jRtQUb0A5YXeX2y3b-bHd',
      'UQBf1imH6qiGW3S7CKwt0Ee_REMl8fjYYeSCQvL1nMuJdS-B',
      'UQDIDUnN31g8qmRyOUrsUxOvYEAtpJR034z7WkS3OGqR29HE'

    ]
  }
};

module.exports = cexExports(config)