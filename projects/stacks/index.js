const axios = require("axios")

async function tvl(timestamp) {
    const stakedStacks = await axios.get(`https://api.stacking.club/api/tvl?timestamp=${timestamp * 1000}`)

    return {
        "blockstack": stakedStacks.data
    };
}

module.exports = {
    stacks: {
        tvl
    },
    tvl,
}
