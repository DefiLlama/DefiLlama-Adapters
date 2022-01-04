const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const sdk = require('@defillama/sdk');
const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl');

const graphUrls = {
  celo: 'https://thegraph.com/hosted-service/subgraph/ubeswap/ubeswap?version=current',
}

module.exports = {
  misrepresentedTokens: true,
  tvl: calculateUsdUniTvl("0x62d5b84bE28a183aBB507E125B384122D2C25fAE",
   "celo",
   "0x471ece3750da237f93b8e339c536989b8978a438",//CELO
   [
    "0x64defa3544c695db8c535d289d843a189aa26b98", //mcUSDxOLD
    "0x918146359264c492bd6934071c6bd31c854edbc3", //mcUSD
    "0x2def4285787d58a2f811af24755a8150622f4361", //wrapped.com cETH
    "0xe919f65739c26a42616b7b8eedc6b5524d1e3ac4", //Optics WETH
    "0xd629eb00deced2a080b7ec630ef6ac117e614f1b", //wrapped.com WBTC
    "0xbe50a3013a1c94768a1abb78c3cb79ab28fc1ace", //Optics WBTC
    "0x765de816845861e75a25fca122bb6898b8b1282a", //cUSD
    "0x00be915b9dcf56a3cbe739d9b9c202ca692409ec", //UBE
    "0xa8d0e6799ff3fd19c6459bf02689ae09c4d78ba7", //mcEURxOLD
    "0xe273ad7ee11dcfaa87383ad5977ee1504ac07568", //mcEUR
    "0x7037f7296b2fc7908de7b57a89efaa8319f0c500", //mCELO
  ],
  "celo")
}
