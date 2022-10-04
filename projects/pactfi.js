const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
    return (
        await retry(
            async (bail) =>
                await axios.get("https://api.pact.fi/api/pools/all?ordering=-tvl_usd")
        )
    ).data.map(p => p.tvl_usd).reduce((a, b) => a + parseFloat(b), 0);
};

module.exports = {
    algorand: {
        fetch
    },
    fetch
};