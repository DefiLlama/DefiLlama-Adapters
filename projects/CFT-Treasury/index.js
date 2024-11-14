const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/sumTokens')

module.exports = {
  tron: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [nullAddress, 'TCdY8kA7XsZ5UUw8jEgbVRbS2MVttrY9AC'],
        [ADDRESSES.tron.JST, 'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9'],
        [ADDRESSES.tron.SUN, 'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S'],
        [ADDRESSES.tron.JM, 'TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR'],
      ]
    }),
  },
};
