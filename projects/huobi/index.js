const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      '12qTdZHx6f77aQ74CPCZGSY47VaRwYjVD8',
      '143gLvWYUojXaWZRrxquRKpVNTkhmr415B',
      '1KVpuCfhftkzJ67ZUegaMuaYey7qni7pPj',
      //These 3 addresses has 48,555 #Bitcoin. This is only less than 3% of the total high value assets we have, including btc, usd, stablecoins, T-bills.. According to Justin Sun https://twitter.com/justinsuntron/status/1590311559242612743
      '14XKsv8tT6tt8P8mfDQZgNF8wtN5erNu5D',
      '1LXzGrDQqKqVBqxfGDUyhC6rTRBN5s8Sbj'
    ],
  },
  ethereum: {
    owners: [
        '0xa929022c9107643515f5c777ce9a910f0d1e490c',
        '0x18709e89bd403f470088abdacebe86cc60dda12e',
        '0xcac725bef4f114f728cbcfd744a731c2a463c3fc',
        '0x0511509A39377F1C6c78DB4330FBfcC16D8A602f',
        '0x1205E4f0D2f02262E667fd72f95a68913b4F7462',
        '0xE4818f8fDe0C977A01DA4Fa467365B8bF22b071E',
        '0x5C985E89DDe482eFE97ea9f1950aD149Eb73829B',
        '0xc589b275e60dda57ad7e117c6dd837ab524a5666',
    ]
  },
  polygon: {
    owners: ['0xd70250731a72c33bfb93016e3d1f0ca160df7e42']
  },
  litecoin: {
    owners: ['MNky8PL58UjL14mcZm3ESvEkYQkzMY9kfu']
  },
  solana: {
    owners: ['88xTWZMeKfiTgbfEmPLdsUCQcZinwUfk25EBQZ21XMAZ']
  },
  tron: {
    owners: [
      'TYh6mgoMNZTCsgpYHBz7gttEfrQmDMABub',
      'TKgD8Qnx9Zw3DNvG6o83PkufnMbtEXis4T',
      'TCQQjfccKdMi4CnPAzmZW5TALH4HbwceVb',
      'TNaRAoLUyYEV2uF7GUrzSjRQTU8v5ZJ5VR',
      'TDToUxX8sH4z6moQpK3ZLAN24eupu2ivA4',
      'TCiRCBNFrL6bFKWL94yWQi5hNMGNp1Nu27',
      'TGn1uvntAVntT1pG8o7qoKkbViiYfeg6Gj',
      'TAuUCiH4JVNBZmDnEDZkXEUXDARdGpXTmX',
      'TF2fmSbg5HAD34KPUH7WtWCxxvgXHohzYM',
      'THZovMcKoZaV9zzFTWteQYd2f3NEvnzxAM',
      'TZ1SsapyhKNWaVLca6P2qgVzkHTdk6nkXa',
    ]
  },
  algorand: {
  owners: ['J4AEINCSSLDA7LNBNWM4ZXFCTLTOZT5LG3F5BLMFPJYGFWVCMU37EZI2AM']
},
  avax: {
    owners: ['0xe195b82df6a797551eb1acd506e892531824af27']
  },
  eos: {
    owners: ['vuniyuoxoeub'],
  },
  ripple: {
    owners: ['rKUDvXFJMFu65LqPTH3Yfpii4rbKT9bSQT'],
  },
}

module.exports = cexExports(config)
