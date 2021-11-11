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
    "0x64defa3544c695db8c535d289d843a189aa26b98", //mCUSD
    "0x2def4285787d58a2f811af24755a8150622f4361", //cETH
    "0xd629eb00deced2a080b7ec630ef6ac117e614f1b", //WBTC
    "0x765de816845861e75a25fca122bb6898b8b1282a", //cUSD
    "0x00be915b9dcf56a3cbe739d9b9c202ca692409ec", //UBE
    "0xa8d0e6799ff3fd19c6459bf02689ae09c4d78ba7", //cEUR
    "0x7037f7296b2fc7908de7b57a89efaa8319f0c500", //mCELO
  ],
  "celo")
}