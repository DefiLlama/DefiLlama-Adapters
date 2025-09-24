const ADDRESSES = require('../helper/coreAssets.json')
const STAKING = "0x151669B501b561a52ad95574603AD52546F46Bf4";

async function tvl(api) {
    const totalSei = await api.call({
        abi: "function getTotalSei() view returns (uint256)",
        target: STAKING,
        params: [],
    });

    const SEI_TOKEN = ADDRESSES.null;

    api.add(SEI_TOKEN, totalSei);
}

module.exports = {
    methodology: "Counts the total SEI locked in the Staking contract using getTotalSei().",
    start: 1000235,
    sei: {
        tvl,
    },
};
