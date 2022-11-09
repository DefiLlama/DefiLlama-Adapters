const { staking } = require("../helper/staking.js");
const { getUniTVL } = require('../helper/unknownTokens')
const { getChainTvl } = require('../helper/getUniSubgraphTvl')

const BANANA_TOKEN = '0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95'
const MASTER_APE = '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9'
const FACTORY_BSC = "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6";
const FACTORY_POLYGON = "0xcf083be4164828f00cae704ec15a36d711491284";
const FACTORY_ETHEREUM = "0xBAe5dc9B19004883d0377419FeF3c2C8832d7d7B";

const chainTvls = getChainTvl({
  bsc: 'https://bnb.apeswapgraphs.com/subgraphs/name/ape-swap/apeswap-subgraph',
  polygon: 'https://api.thegraph.com/subgraphs/name/apeswapfinance/dex-polygon',
})

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: chainTvls('bsc'),
    staking: staking(MASTER_APE, BANANA_TOKEN, "bsc"),
  },
  polygon: {
    tvl: getUniTVL({ factory: FACTORY_POLYGON, chain: 'polygon', useDefaultCoreAssets: true }),
  },
  ethereum: {
    tvl: getUniTVL({ factory: FACTORY_ETHEREUM, useDefaultCoreAssets: true }),
  },
  telos: {
    tvl: getUniTVL({ factory: '0x411172Dfcd5f68307656A1ff35520841C2F7fAec', chain: 'telos', useDefaultCoreAssets: true }),
  },
  methodology: "TVL comes from the DEX liquidity pools, staking TVL is accounted as the banana on 0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9",
}