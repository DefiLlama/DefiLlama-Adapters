const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')

module.exports = {
  tron: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, 'TCdY8kA7XsZ5UUw8jEgbVRbS2MVttrY9AC'],
        [ADDRESSES.tron.USDT, 'TYaaJsD44isGwQUbvHNuii8nAnTKSxPcND'],
        [ADDRESSES.tron.USDD, 'TWupFtHWnURhDNrWBfB2tK3zD4uALurBgk'],
        [ADDRESSES.tron.JM, 'TK76Z1mJQHN98WsuUUKeDZnNhwRsj6p5wo'],
      ]
    }),
  },
};
