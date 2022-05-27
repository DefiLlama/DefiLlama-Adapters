const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens')

const graphUrls = {
  boba: 'https://graph.mainnet.boba.network/subgraphs/name/swapperchan/exchange',
}
const chainTvl = getChainTvl(graphUrls, "factories", "liquidityUSD")

module.exports={
    boba:{
        // tvl: chainTvl("boba")
        tvl: getUniTVL({
          factory: '0x3d97964506800d433fb5dbebdd0c202ec9b62557',
          chain: 'boba',
          coreAssets: [
            '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000',
            '0xa18bf3994c0cc6e3b63ac420308e5383f53120d7',
            
          ]
        })
    }
}
