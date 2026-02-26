const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "TVL is the total value of the assets locked in the 100xsoon protocol.",
  base: {
    tvl: sumTokensExport({
      owner: '0xF114A1224E1A44EA65d7472d40Dd53e8c45D5928',
      tokens: [
        ADDRESSES.base.USDC,
        '0xb9e1fd5a02d3a33b25a14d661414e6ed6954a721'
      ],
    }),
  }
}