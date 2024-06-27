const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')


module.exports = {
    misrepresentedTokens: true,
  methodology:
    "Factory address (0xc0719a9A35a2D9eBBFdf1C6d383a5E8E7b2ef7a8) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  fantom: {
    tvl: getUniTVL({ factory: '0xc0719a9A35a2D9eBBFdf1C6d383a5E8E7b2ef7a8', useDefaultCoreAssets: true }),
    staking: stakingPricedLP("0x546dA2105c52dc2dBA3a4320b43bc2cfDA9cB311", "0xF24be6c063Bee7c7844dD90a21fdf7d783d41a94", "fantom", "0x194C3973Eb43Ba98941C5e9D8e3D06EF9e6aa399", "wrapped-fantom")
  },
}; // node test.js projects/wingswap/index.js