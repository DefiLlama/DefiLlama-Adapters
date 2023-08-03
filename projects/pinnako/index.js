const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
    era: {
        tvl: sumTokensExport({
          owner: '0x87A43dfAB5068c9Ae2f75da2906559bc9A71b42d',
          tokens: [
            ADDRESSES.era.WETH,
            ADDRESSES.era.WBTC,
            ADDRESSES.era.USDC,
            ADDRESSES.era.USDT,
          ]
        }),
        staking: sumTokensExport({ owner: '0x2A283C805D11ad77161Be0c503805a2b8Bc7Fd84', tokens: ['0xf8C6dA1bbdc31Ea5F968AcE76E931685cA7F9962'] }),
    },
}
