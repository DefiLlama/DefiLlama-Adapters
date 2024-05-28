const ADDRESSES = require('../helper/coreAssets.json')

const Earn = "0xf5fA1728bABc3f8D2a617397faC2696c958C3409";

async function tvl(api) {
    let amount = await api.call({abi: "uint256:getTotalDelegateAmount",target: Earn})
    return {
        ['core:' + ADDRESSES.null]: amount
    }
}

module.exports = {
    methodology: "Total Core staking Value.",
    core: {
        tvl: tvl,
    },
};