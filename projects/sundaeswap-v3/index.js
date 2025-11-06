const { getAdaInAddress } = require('../helper/chain/cardano')

async function tvl(){
    const ammLocked = await getAdaInAddress("addr1x8srqftqemf0mjlukfszd97ljuxdp44r372txfcr75wrz26rnxqnmtv3hdu2t6chcfhl2zzjh36a87nmd6dwsu3jenqsslnz7e")
    const ammLocked2 = await getAdaInAddress("addr1z8srqftqemf0mjlukfszd97ljuxdp44r372txfcr75wrz2auzrlrz2kdd83wzt9u9n9qt2swgvhrmmn96k55nq6yuj4qw992w9")
    // const orderBookLocked = await getAdaInAddress("addr1w8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacprc9mw")
    return {
        "cardano": (+ammLocked + +ammLocked2) * 2
    }
}

module.exports={
    timetravel: false,
    cardano:{
        tvl
    }
}
