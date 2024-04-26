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
      '1AQLXAB6aXSVbRMjbhSBudLf1kcsbWSEjg', // add on 23/02/2024 (we defillama)
      '1ENWYLQZJRAZGtwBmoWrhmTtDUtJ5LseVj'
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
      '0xa03400e098f4421b34a3a44a1b4e571419517687',
      '0x598273ea2cabd9f798564877851788c5e0d5b7b9', // start add on 23/02/2024 (we defillama)
      '0x18709e89bd403f470088abdacebe86cc60dda12e',
      '0x4fb312915b779b1339388e14b6d079741ca83128',
      '0x30741289523c2e4d2a62c7d6722686d14e723851',
      '0x5c985e89dde482efe97ea9f1950ad149eb73829b',
      '0xe4818f8fde0c977a01da4fa467365b8bf22b071e',
      '0xe93381fb4c4f14bda253907b18fad305d799241a',  // end add on 23/02/2024 (we defillama)
      
    ],
    blacklistedTokens: [
      '0x0316eb71485b0ab14103307bf65a021042c6d380', // HBTC , we already track their backed BTC (1btc wallet on the list)
    ]
  },
  polygon: {
    owners: [
      '0xd70250731a72c33bfb93016e3d1f0ca160df7e42',
      '0x9a7ffd7f6c42ab805e0edf16c25101964c6326b6', // add on 23/02/2024 
      '0x18709e89bd403f470088abdacebe86cc60dda12e',
      '0x2177c77a1f3c4900de7668662706633db4688726',
           ]
  },
  litecoin: {
    owners: [
      'MNky8PL58UjL14mcZm3ESvEkYQkzMY9kfu',
      'LYmdXiH1u6UN2bFetfTGnNuFgEG64FWVLU',
      'MGZv8pEkrsmpa2YAXRVXTtdCPBMnnR28fY',
      'MCRXTQ5uuBh6Qt8t4LuqZNvruZ5SmWXjrY'
    ]
  },
  solana: {
    owners: [
      '88xTWZMeKfiTgbfEmPLdsUCQcZinwUfk25EBQZ21XMAZ',
      'BY4StcU9Y2BpgH8quZzorg31EGE4L1rjomN8FNsCBEcx', // add on 23/02/2024 
      '8NBEbxLknGv5aRYefFrW2qFXoDZyi9fSHJNiJRvEcMBE',
      '5bJcc9eb2XE7mqcET2xDuAdMGuXWybb4YPmAHLjKLhQG',
           ]
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
      'TFTWNgDBkQ5wQoP8RXpRznnHvAVV8x5jLu', // add on 23/02/2024 
      'TK86Qm97uM848dMk8G7xNbJB7zG1uW3h1n',
      'TT5iK8oqGEyRKJAnRwrLSZ4fM5y77F2LNT',
    ]
  },
  algorand: {
    owners: ['J4AEINCSSLDA7LNBNWM4ZXFCTLTOZT5LG3F5BLMFPJYGFWVCMU37EZI2AM']
  },
  avax: {
    owners: [
      '0xe195b82df6a797551eb1acd506e892531824af27',
      '0xa77ff0e1c52f58363a53282624c7baa5fa91687d', //start add on 23/02/2024 
      '0x18709e89bd403f470088abdacebe86cc60dda12e',
      '0x8b6a3587676719a4fecbb24b503a3634c44a44d5',
           ]
  },
  eos: {
    owners: ['vuniyuoxoeub'],
  },
  ripple: {
    owners: [
      'rKUDvXFJMFu65LqPTH3Yfpii4rbKT9bSQT', 
      'raC4udvEeeni6aLPHbz9RKjHTQiWxKPfom',
      'ra4haepf6fehiCfVvB33j1D7vmv7JJD8M5', // add on 23/02/2024 
      'rNPuS242i9ufMPEMusnjYPxyyu4STqSDGq',
      'rPzT7GA6vWU3PvYSXBpdP5fQPnzwVLwL24',
    ],
  },
  arbitrum: {
    owners: [
      '0xf2dbc42875e7764edbd89732a15214a9a0deb085',
      '0xce7ec11a5f306c6b896526149db1a86c7d1531e2', // add on 23/02/2024 
      '0x18709e89bd403f470088abdacebe86cc60dda12e',
      '0x82d015d74670d8645b56c3f453398a3e799ee582',   
           ],
  },
  optimism: {
    owners: [
    '0x9ef21be1c270aa1c3c3d750f458442397fbffcb6',
    '0xe0b7a39fef902c21bad124b144c62e7f85f5f5fa', // add on 23/02/2024 
    '0x18709e89bd403f470088abdacebe86cc60dda12e',
    '0xd3cc0c7d40366a061397274eae7c387d840e6ff8'
           ],
  },
  bsc: {
    owners: [
      '0xdd3cb5c974601bc3974d908ea4a86020f9999e0c', // add on 23/02/2024 
      '0x18709e89bd403f470088abdacebe86cc60dda12e',
      '0xafdfd157d9361e621e476036fee62f688450692b',
           ],
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