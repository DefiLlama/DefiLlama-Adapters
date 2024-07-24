const { staking } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x570aA1E0aa3d679Bc9DaAA47564ed3Daba1208FE) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CASINO tokens found in the Masterchef(0x81b5118bF8A720B19FEC6F3078d2b555790cb0AB).",
    cronos: {
      tvl: getUniTVL({
        factory: '0x570aA1E0aa3d679Bc9DaAA47564ed3Daba1208FE',
        useDefaultCoreAssets: true,
      
      }),
        staking: staking("0x81b5118bF8A720B19FEC6F3078d2b555790cb0AB", "0x95ac4a86c0677971c4125ACe494e3C17a87a4C61")
    }
}