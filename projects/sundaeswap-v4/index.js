// SundaeSwap V4
const { sumTokens2 } = require('../helper/chain/cardano');
const ammLockedAssets = ["addr1zysundaev4jxq60ehm8tlz6v8nk6lpxpnvgfa2jeszs55f4uzrlrz2kdd83wzt9u9n9qt2swgvhrmmn96k55nq6yuj4qeujly6"];

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
