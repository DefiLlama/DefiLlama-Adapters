const sdk = require('@defillama/sdk')
const { getFixBalances } = require('../helper/portedTokens')
const { getTokenBalance } = require('../helper/tron')
const { getUniTVL } = require('../helper/unknownTokens')
const { sleep } = require('../helper/utils')

const tokens = {
  ACTIV: { 'address': 'TVoxBVmFuBM7dsRnfi1V8v1iupv4uyPifN', 'id': '_activ' },
  BBT: { 'address': 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL', 'id': '_bbt' },
  BEMT: { 'address': 'TBp6ZMzkxci5o4sJjFa6Fo9Wy36gcubQLW', 'id': 'bem' },
  BTT: { 'address': 'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4', 'id': 'bittorrent' },
  CREED: { 'address': 'TM2fhs1CFiS696VW13s3oBuDdPazCEGcfJ', 'id': '_creed' },
  CREEDX: { 'address': 'TQSC8P2nLsawUZHF6iMAD6KPH8HdJXFWYi', 'id': '_creedx' },
  CUBE: { 'address': 'TQxzbBVFRFUgHXnhyCRiatrkwX9BAJnHam', 'id': '_cube' },
  CYFM: { 'address': 'TZ5jA9F5zGRgi9qk9ATMu6D7wyEpnxQGJh', 'id': 'cyberfm' },
  ICR: { 'address': 'TKqvrVG7a2zJvQ3VysLoiz9ijuMNDehwy7', 'id': 'intercrone' },
  JM: { 'address': 'TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR', 'id': 'justmoney-2' },
  JST: { 'address': 'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9', 'id': 'just' },
  KLV: { 'address': 'TVj7RNVHy6thbM7BWdSe9G6gXwKhjhdNZS', 'id': 'klever' },
  KODX: { 'address': 'TTUwzoZAK6rpDjpSh8B2XFTnxGfbMLHJaq', 'id': 'kodx' },
  KTY: { 'address': 'TTroZqb95vmsw4kppupQ8tVEzkNDDP2bcG', 'id': '_kty' },
  LDA: { 'address': 'TNP1D18nJCqQHhv4i38qiNtUUuL5VyNoC1', 'id': '_lda' },
  LUMI: { 'address': 'TDBNKiYQ8yfJtT5MDP3byu7f1npJuG2DBN', 'id': 'lumi-credits' },
  NFT: { 'address': 'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq', 'id': 'apenft' },
  NOLE: { 'address': 'TPt8DTDBZYfJ9fuyRjdWJr4PP68tRfptLG', 'id': '_nole' },
  OLDJM: { 'address': 'TT8VkSkW6igkiRsV5WiJgLrsbVwY5bLLjA', 'id': 'justmoney' },
  SafeMoney: { 'address': 'TNBrVEzuVYbNbGF2ua3ivSX5Y5V9N4xhax', 'id': 'safemoney' },
  SUN: { 'address': 'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S', 'id': 'sun-token' },
  TBT: { 'address': 'TJpCQC2gJRAbqG9nuQHvzYBmCuYJQzP3SS', 'id': '_tbt' },
  TNT: { 'address': 'TL33cN6t22RcKyqPKkb14iVrPHDFaFMH7t', 'id': '_tnt' },
  TRX: { 'address': 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', 'id': 'tron' },
  turu: { 'address': 'TK8K7HFDLkhYS6XnFC8MKQkVK6Xq8D13qJ', 'id': '_turu' },
  TREX: { 'address': 'THyYjzy42cy83Nwg6pbsUTcV1GBrPPqGE5', 'id': '_trex' },
  TWJ: { 'address': 'TNq5PbSssK5XfmSYU4Aox4XkgTdpDoEDiY', 'id': '_twj' },
  USDD: { 'address': 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn', 'id': 'usdd' },
  USDT: { 'address': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 'id': 'tether' },
  USTX: { 'address': 'TYX2iy3i3793YgKU5vqKxDnLpiBMSa5EdV', 'id': '_ustx' },
  VBS: { 'address': 'TJRc6ZTMhHEPrWPtfsVvXW1mxHPLw1arZo', 'id': '_vbs' },
  WOX: { 'address': 'TYVFMntFj7xLMxp1CvuXwg9LpPw1dPwWhM', 'id': '_wox' },
  ZLF: { 'address': 'TXoPCbHtWTerfiNjFBpJdMQqQJoXoT87pq', 'id': '_zlf' },
}

const pairs = [
  [ tokens.TRX, tokens.OLDJM, 'TFijK2dCUsrXoZM7PYhFqnM9F4Tac8uBJt' ],
  [ tokens.TRX, tokens.USDT, 'TYA7DfE44XFsZEpBm7M2HAmEgU5kCtDDXg' ],
  [ tokens.USDT, tokens.OLDJM, 'TSGv8is6ZMeHRwMQCvq6f16YFTLbw2bpmr' ],
  [ tokens.SafeMoney, tokens.TRX, 'TTqB2CRJ2PF9qbCRkSVVGsFbx9mZUFNZS3' ],
  [ tokens.NOLE, tokens.USDT, 'TEg25qPxj9zecferiUbf2Senqmbuae7p55' ],
  [ tokens.TRX, tokens.SUN, 'TGzv3DHcsbxmCNj1Cd1W6P3Ao37fs2mot8' ],
  [ tokens.LUMI, tokens.USDT, 'TWEee7dNN7Zc2M8f13M28KhBGrroVrdGxM' ],
  [ tokens.BBT, tokens.TRX, 'TTFYn18KrMxpdoQCxsp5SYjmDgS6dDEQTv' ],
  [ tokens.ICR, tokens.TRX, 'TTHoKhr85UiMPSHmdTukLkv3mAjjSdsiH5' ],
  [ tokens.CREED, tokens.TRX, 'TVcbypQLttW96yHzBraXBVnhcKC7HDRSfD' ],
  [ tokens.TRX, tokens.CREEDX, 'TN4BUph6ubYbmBDy2u9wpqoNg3DR1vrZRN' ],
  [ tokens.USDT, tokens.CYFM, 'TYNTeRHHbqH4sm5GcrwhQqa89ZaBGipEuG' ],
  [ tokens.USDT, tokens.KLV, 'TBB26dZsWFPDfYNyPWpD8LtdKCCRr3aDbY' ],
  [ tokens.TRX, tokens.KTY, 'TGMgXjSEzf5h7qK7cMZPuvu4wAk9x21Vwu' ],
  [ tokens.NFT, tokens.TRX, 'TQy4L8yguUXEsxUZmyrLfADgtwRhL6GgWH' ],
  [ tokens.JST, tokens.TRX, 'TJAZ6MvFBUnRw8vVDvgvGRMWGzDVaS6eqr' ],
  [ tokens.TNT, tokens.TRX, 'TFT7z2ELWzPuUeP8FgPTEAYe7syQ4TTYfo' ],
  [ tokens.TRX, tokens.ZLF, 'TEwbxEXNd3P7fVP6v4W91mRhGCYeGUkEdE' ],
  [ tokens.turu, tokens.TRX, 'TVBdRMsCnaNmY7jDVRm6VJxfeZZW3qKWoE' ],
  [ tokens.TRX, tokens.KLV, 'TNMUT9h6zZDnxouGf1EfXQ4yt1nHhnM4Ae' ],
  [ tokens.TWJ, tokens.USDT, 'TA95HcnsqfzKarHJzfB4V4JvrnZnqnBvWU' ],
  [ tokens.BTT, tokens.TRX, 'TMz4JoDPUv8rgqUaZCkaSrH7kQ819z2Vd9' ],
  [ tokens.TRX, tokens.ACTIV, 'TG2ZRTv3WX9cD53TEcTyjuuHd8pWCAg11X' ],
  [ tokens.TRX, tokens.KODX, 'TL8wEwke3gGrnw4zEBxisSG2RxehZT7xXs' ],
  [ tokens.BEMT, tokens.TRX, 'TWXEXQyEwSzSBENrWyiGu69Dd3yU8QREHV' ],
  [ tokens.TRX, tokens.WOX, 'TG1CirSZHqQ3yGJBMfXHjBcWVctfihciQL' ],
  [ tokens.TREX, tokens.TRX, 'TVzgLYrKSf2ZrPkWP7SbFXk6iKfR7PNHtR' ],
  [ tokens.LDA, tokens.TRX, 'TDV1P9ZpN3VaE8Rti6PXDZ3gAWUNMbRfa2' ],
  [ tokens.TRX, tokens.CUBE, 'TCqsrTUsBHBFoDRwjvjn6zooj6Cp6e1wUk' ],
  [ tokens.TRX, tokens.JM, 'TR7SpMHzp5ZfsBedbXzQ5CJsqBmg8oxzzr' ],
  [ tokens.USDT, tokens.JM, 'THTWV7R3U7XQsHWQt8YHgsqirvY9QttB7u' ],
  [ tokens.USDD, tokens.USDT, 'TNR1gJVMjE47uZxCrQaQe1xat2uBs3jAHr' ],
  [ tokens.TBT, tokens.TRX, 'TWwbk4ypVR6aKb2CS8TvERg1rxATUfWavP' ],
  [ tokens.TRX, tokens.USTX, 'TUFeu1WbJwL4jCAyu9pcotuASnbxEUbphn' ],
  [ tokens.BBT, tokens.VBS, 'TH6yNkvtthsPJLqVE1M8ri7zX9G7pi3fRR' ],
]

async function tronTvl() {
  const balances = {}

  for (let [tokenA, tokenB, pool] of pairs) {
    if (!tokenA.id.startsWith('_')) sdk.util.sumSingleBalance(balances, tokenA.id, await getTokenBalance(tokenA.address, pool))
    if (!tokenB.id.startsWith('_')) sdk.util.sumSingleBalance(balances, tokenB.id, await getTokenBalance(tokenB.address, pool))
    await sleep(1000)
  }

  return balances
}

module.exports = {
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0xF2Fb1b5Be475E7E1b3C31082C958e781f73a1712',
      coreAssets: [
        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
        '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
        '0x55d398326f99059ff775485246999027b3197955', // USDT
      ],
    }),
  },
  // bittorrent: {
  //   tvl: async (ts, _block, { bittorrent: block }) => {
  //     const { balances } = await getUniTVL({
  //         chain: 'bittorrent',
  //         factory: '0x4dEb2f0976DC3Bf351555524B3A24A4feA4e137E',
  //         coreAssets: [
  //           '0x23181f21dea5936e24163ffaba4ea3b316b57f3c', // BTT
  //           '0xedf53026aea60f8f75fca25f8830b7e2d6200662', // TRX
  //         ],
  //         withMetaData: true,
  //     })(ts, _block, { bittorrent: block })

  //     const fixBalances = await getFixBalances('bittorrent')

  //     fixBalances(balances)

  //     return balances
  //   },
  // },
  polygon: {
    tvl: getUniTVL({
      chain: 'polygon',
      factory: '0xD36ABA9EC96523B0A89886C76065852ADFE2EB39',
      coreAssets: [
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // MATIC
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
      ],
    }),
  },
  tron: {
    tvl: tronTvl
  },
}
