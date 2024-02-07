const { cexExports } = require('../helper/cex')
const { mergeExports, sliceIntoChunks, sleep } = require('../helper/utils')
const { post, get } = require('../helper/http')
const sdk = require('@defillama/sdk')

const config = {
  bitcoin: {
    owners: [
      '12qTdZHx6f77aQ74CPCZGSY47VaRwYjVD8',
      '143gLvWYUojXaWZRrxquRKpVNTkhmr415B',
      '1KVpuCfhftkzJ67ZUegaMuaYey7qni7pPj',
      //These 3 addresses has 48,555 #Bitcoin. This is only less than 3% of the total high value assets we have, including btc, usd, stablecoins, T-bills.. According to Justin Sun https://twitter.com/justinsuntron/status/1590311559242612743
      '14XKsv8tT6tt8P8mfDQZgNF8wtN5erNu5D',
      '1LXzGrDQqKqVBqxfGDUyhC6rTRBN5s8Sbj',
      '1HckjUpRGcrrRAtFaaCAUaGjsPx9oYmLaZ', // add on 08/08/2023 (we defillama)
      '1L15W6b9vkxV81xW5HDtmMBycrdiettHEL', // add on 08/08/2023 (we defillama)
      '14o5ywJJmLPJe8egNo7a5fSdtEgarkus33', // add on 08/08/2023 (we defillama)
      '1BuiWj9wPbQwNY97xU53LRPhzqNQccSquM', // add on 08/08/2023 (we defillama)
      '1ENWYLQZJRAZGtwBmoWrhmTtDUtJ5LseVj',
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
      '0x6b2286fc3a9265bab3f064808022aca54de4b6ce', // add on 08/08/2023 (we defillama)
      '0x3d655889d197125fb90dcb72e4a287a8410ed1b9', // add on 08/08/2023 (we defillama)
      '0x2abc22eb9a09ebbe7b41737ccde147f586efeb6a', // add on 08/08/2023 (we defillama)
      '0xa5d7f0f7027fa8f4d1be8042e1e43bbdec36951e', // add on 08/08/2023 (we defillama)
      '0xeee28d484628d41a82d01e21d12e2e78d69920da', // add on 08/08/2023 (we defillama)
      '0x6748f50f686bfbca6fe8ad62b22228b87f31ff2b', // add on 08/08/2023 (we defillama)
      '0x34189c75cbb13bdb4f5953cda6c3045cfca84a9e', // add on 08/08/2023 (we defillama)
      '0x1062a747393198f70f71ec65a582423dba7e5ab3', // add on 08/08/2023 (we defillama)
      '0xab5c66752a9e8167967685f1450532fb96d5d24f', // add on 08/08/2023 (we defillama)
      '0xdb0e89a9b003a28a4055ef772e345e8089987bfd', // add on 08/08/2023 (we defillama)
      '0xfdb16996831753d5331ff813c29a93c76834a0ad', // add on 08/08/2023 (we defillama)
      '0x46705dfff24256421a05d056c29e81bdc09723b8', // add on 08/08/2023 (we defillama)
      '0xfd54078badd5653571726c3370afb127351a6f26', // add on 08/08/2023 (we defillama)
      '0x07ef60deca209ea0f3f3f08c1ad21a6db5ef9d33', // add on 08/08/2023 (we defillama)
      '0x18916e1a2933cb349145a280473a5de8eb6630cb', // add on 08/08/2023 (we defillama)
      '0xfa4b5be3f2f84f56703c42eb22142744e95a2c58', // add on 08/08/2023 (we defillama)
      '0x0a98fb70939162725ae66e626fe4b52cff62c2e5', // add on 08/08/2023 (we defillama)
      '0x918800e018a0eeea672740f88a60091c7d327a79', // add on 08/08/2023 (we defillama)
      '0xadb2b42f6bd96f5c65920b9ac88619dce4166f94', // add on 08/08/2023 (we defillama)
      '0x42dc966b7ecc3c6cc73e7bc04862859d5bddce65', // add on 08/08/2023 (we defillama)
      '0xe8d8a02601f54acb6fb69537be1f1d7cc76ccd8c', // add on 08/08/2023 (we defillama)
      '0xf881bcb3705926cea9c598ab05a837cf41a833a9', // add on 08/08/2023 (we defillama)
      '0xb9F775179bcC7FcF4534700a48F09C590E390eAd',
    ],
    blacklistedTokens: [
      '0x0316eb71485b0ab14103307bf65a021042c6d380', // HBTC , we already track their backed BTC (1btc wallet on the list)
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
      'TDvf1dSBhR7dEskJs17HxGHheJrjXhiFyM',
      'TUJGLHo3rq4EAUY1LHRhNkHPX8qmrv9WFs', // add on 08/08/2023 (we defillama)
      'TRSXRWudzfzY4jH7AaMowdMNUXDkHisbcd', // add on 08/08/2023 (we defillama)
      'TU1ZA8T2g8PvLK8BfM7N94xpmSSpyfxZoK',
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
    owners: ['rKUDvXFJMFu65LqPTH3Yfpii4rbKT9bSQT', 'raC4udvEeeni6aLPHbz9RKjHTQiWxKPfom'],
  },
  arbitrum: {
    owners: ['0xf2dbc42875e7764edbd89732a15214a9a0deb085'],
  },
  optimism: {
    owners: ['0x9ef21be1c270aa1c3c3d750f458442397fbffcb6'],
  },
}

module.exports = mergeExports([
  cexExports(config),
  { ethereum: { tvl: stakingTVL, } }
])
module.exports.methodology = 'We added the wallets from here https://github.com/huobiapi/Tool-Node.js-VerifyAddress/blob/main/snapshot/huobi_por_20230701.csv . We are not tracking 3 wallets, 2 on Heco Chain, 1 on BTTC chain. We also count stUSDT.'


async function stakingTVL() {
  const withdrawalAddress = '0x08DeB6278D671E2a1aDc7b00839b402B9cF3375d'
  let fetchedValidators = 2400
  let size = 200
  let ethBalance = (await sdk.api2.eth.getBalance({ target: '0x08DeB6278D671E2a1aDc7b00839b402B9cF3375d'})).output/1e18
  do {
    const validators = (await get(`https://beaconcha.in/api/v1/validator/withdrawalCredentials/${withdrawalAddress}?limit=${size}&offset=${fetchedValidators}`)).data.map(i => i.publickey)
    fetchedValidators += validators.length
    await addValidatorBalance(validators)
    await sleep(10000)
  } while (fetchedValidators % size === 0)

  return {
    ethereum: ethBalance
  }

  async function addValidatorBalance(validators) {
    if (validators.length > 100) {
      const chunks = sliceIntoChunks(validators, 100)
      for (const chunk of chunks) await addValidatorBalance(chunk)
      return;
    }

    const { data } = await post('https://beaconcha.in/api/v1/validator', {
      indicesOrPubkey: validators.join(',')
    })


    data.forEach((i) => ethBalance += i.balance/1e9)
  }
}