const { fetchURL } = require('../helper/utils')

async function Tvl() {
    let usdc = (await fetchURL("http://207.246.92.114:3003/gettvl")).data.tvl

    return {
        "usd-coin": usdc
    }
}

module.exports = {
    methodology: "Display the TVL on Milko Farm in USDC from API",
    milkomeda: {
        tvl: Tvl
    }
}

// node test.js projects/milko-farm/index.js
