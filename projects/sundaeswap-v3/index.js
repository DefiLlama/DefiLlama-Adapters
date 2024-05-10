const { getAdaInAddress } = require('../helper/chain/cardano')

async function tvl(){
    const ammLocked = await getAdaInAddress("addr1x8srqftqemf0mjlukfszd97ljuxdp44r372txfcr75wrz26rnxqnmtv3hdu2t6chcfhl2zzjh36a87nmd6dwsu3jenqsslnz7e")
    // const orderBookLocked = await getAdaInAddress("addr1w8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacprc9mw")
    return {
        "cardano": ammLocked * 2
    }
}

module.exports={
    timetravel: false,
    cardano:{
        tvl
    }
}
