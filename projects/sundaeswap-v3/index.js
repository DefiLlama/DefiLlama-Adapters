// SundaeSwap V3
const { sumTokens2 } = require('../helper/chain/cardano');
const ammLockedAssets = ["addr1x8srqftqemf0mjlukfszd97ljuxdp44r372txfcr75wrz26rnxqnmtv3hdu2t6chcfhl2zzjh36a87nmd6dwsu3jenqsslnz7e", "addr1z8srqftqemf0mjlukfszd97ljuxdp44r372txfcr75wrz2auzrlrz2kdd83wzt9u9n9qt2swgvhrmmn96k55nq6yuj4qw992w9"];

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