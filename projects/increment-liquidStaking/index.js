const { fetchURL } = require("../helper/utils");

// increment liquid staking link: https://app.increment.fi/staking

async function tvl() {
    const { data: tvls } = await fetchURL(
        "https://app.increment.fi/info/tvl"
    );
    return tvls.LiquidStakingTVL;
}
async function fetch() {
    const { data: tvls } = await fetchURL(
        "https://app.increment.fi/info/tvl"
    );
    return tvls.LiquidStakingTVL;
}

module.exports = {
    methodology: "Counting the flow tokens staked by users in the protocol, and tokens locked by unstaking are not counted.",
    flow: {
        fetch: tvl,
    },
    fetch,
};
