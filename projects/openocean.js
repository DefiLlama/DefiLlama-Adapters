const { getUniTVL, getLPData } = require('./helper/unknownTokens')
const { sumTokens2 } = require('./helper/unwrapLPs')
const { staking } = require('./helper/staking')

module.exports = {
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0xd76d8c2a7ca0a1609aea0b9b5017b3f7782891bf',
      coreAssets: [
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // BUSD
      ]
    }),
    staking: staking('0x44eB0f1ce777394564070f9E50dD8784FCDB7e6a', '0x9029fdfae9a03135846381c7ce16595c3554e10a', 'bsc')
  },
  ethereum: {
    tvl: async (_, block) => {  // work around since I dont know how to get factory
      const data = await getLPData({ lps: [
        '0x3c647b36e30f4be590dcea349a0ecf8c259660af',
        '0x9f872cd72521a6189ddf25cd752e6386129647d9',
        '0x61583697a9f4dc2e40ea6afec2502c4a76a8785d',
        '0x526648286569cefc133ce78f5f7b519c1c6862e0',
      ], allLps: true, block, })
      const toa = Object.entries(data).map(([lp, tokens]) => Object.values(tokens).map(t => [t, lp])).flat()
      return sumTokens2({ tokensAndOwners: toa, block, })
    },
    staking: staking('0xb99d38eb69214e493b1183ffa3d561fc9f75d519', '0x7778360f035c589fce2f4ea5786cbd8b36e5396b',)
  },
  avax: {
    tvl: getUniTVL({
      chain: 'avax',
      factory: '0x042AF448582d0a3cE3CFa5b65c2675e88610B18d',
      coreAssets: [
        '0xc7198437980c041c805a1edcba50c1ce5db95118', // USDT
      ]
    }),
    staking: staking('0x4C431b568e8baAB20F004BB16E44570e8E0cD6D7', '0x0ebd9537a25f56713e34c45b38f421a1e7191469', 'avax')
  },
}
