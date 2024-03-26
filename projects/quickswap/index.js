const ADDRESSES = require('../helper/coreAssets.json')
const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { staking } = require('../helper/staking');


module.exports = {
  misrepresentedTokens: true,
    polygon:{
    staking: staking("0x958d208Cdf087843e9AD98d23823d32E17d723A1", ADDRESSES.polygon.QUICK),
    tvl: getChainTvl({
      polygon: 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06'
    })('polygon')
  },
    hallmarks:[
    [1611917218, "Aavegotchi LM"],
    [1619095618, "QUICK staking - Dragon's Liar launch"],
    [1619611200, "DeFi season on Polygon PoS begun"],
    [1623851400, "Iron Finance V1 collapse"],
    [1651668418, "QUICK split by 1:1000"],
    [1652481840, "QuickSwap’s GoDaddy Domain Hijack"]
   ]
}
