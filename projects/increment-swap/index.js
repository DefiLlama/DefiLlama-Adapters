const { fetchURL } = require("../helper/utils");


// increment swap link: https://app.increment.fi/swap
// swap info: https://app.increment.fi/infos

async function tvl() {
    const { data: tvls } = await fetchURL(
        "https://app.increment.fi/info/tvl"
    );
    return tvls.DexTVL;
}
async function fetch() {
    const { data: tvls } = await fetchURL(
        "https://app.increment.fi/info/tvl"
    );
    return tvls.DexTVL;
}

module.exports = {
    methodology: "This is the first permissionless dex on the flow blockchain.",
    flow: {
        fetch: tvl,
    },
    fetch,
};
