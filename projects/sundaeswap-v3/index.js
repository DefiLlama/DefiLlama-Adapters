// SundaeSwap V3
const { sumTokens2 } = require('../helper/chain/cardano');
const ammLockedAssets = [
    "addr1x8srqftqemf0mjlukfszd97ljuxdp44r372txfcr75wrz26rnxqnmtv3hdu2t6chcfhl2zzjh36a87nmd6dwsu3jenqsslnz7e", 
    "addr1z8srqftqemf0mjlukfszd97ljuxdp44r372txfcr75wrz2auzrlrz2kdd83wzt9u9n9qt2swgvhrmmn96k55nq6yuj4qw992w9", 
    "addr1z94tv2296rvdv2ywysankephl7wqnx3cuzyz3r66dd79azlsu9a4r0qcjc3ew3gwkcjjy27wn3gsewptyyaanncha2pqllrfym",
    "addr1x9x70xsvzuvqqv9l7npksfwtd6vu4gq8h33j77y4vx3x64jrnxqnmtv3hdu2t6chcfhl2zzjh36a87nmd6dwsu3jenqskqe4x0"
];

async function tvl() {
    const lockedAssets = await sumTokens2({
        owners: ammLockedAssets
    })
    return lockedAssets
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl
    }
}