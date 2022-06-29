const { fetchURL } = require("../helper/utils");

async function tvl() {
    // info: https://app.increment.fi/markets
    const { data: tvls } = await fetchURL(
        "https://app.increment.fi/info/tvl"
    );

    return tvls.LendingTVL;
}

module.exports = {
    methodology: "This is the first lending protocol on the flow blockchain , and temporarily uses the project's own endpoint.",
    flow: {
        tvl
    }
}