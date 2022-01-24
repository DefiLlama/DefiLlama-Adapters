const { getAvaxUniswapTvl} = require('../helper/getUniSubgraphTvl')
const { stakingPricedLP } = require('../helper/staking')

const PARTY_WAVAX_LP = "0x379842a6cd96a70ebce66004275ce0c68069df62";
const COREASSETNAME = "avalanche-2";


module.exports={
    avax:{
        tvl: getAvaxUniswapTvl( "https://api.thegraph.com/subgraphs/name/josema03/partyswap-dex", "partyswapFactories", "totalLiquidityETH"),
        staking: stakingPricedLP("0xA07d1932775f22DaeDA671812c16F859b4257363","0x25afd99fcb474d7c336a2971f26966da652a92bc","avax", PARTY_WAVAX_LP, COREASSETNAME),
        
    }
}