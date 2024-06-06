const { stakingPricedLP } = require('../helper/staking')
const { getUniTVL } = require('../helper/unknownTokens')

const PARTY_WAVAX_LP = "0x379842a6cd96a70ebce66004275ce0c68069df62";
const COREASSETNAME = "avalanche-2";


module.exports={
    avax:{
        tvl: getUniTVL({ factory: '0x58a08bc28f3e8dab8fb2773d8f243bc740398b09', useDefaultCoreAssets: true, }), 
        staking: stakingPricedLP("0xA07d1932775f22DaeDA671812c16F859b4257363","0x25afd99fcb474d7c336a2971f26966da652a92bc","avax", PARTY_WAVAX_LP, COREASSETNAME),
    }
}