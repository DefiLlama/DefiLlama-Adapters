const { nullAddress } = require("../helper/tokenMapping")

async function tvl(_, _b, _cb, { api, }) {
    const tvl = await api.call({
        target: "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0",
        abi: "uint256:totalETHDeposited"
    })
    return {
        [nullAddress]: tvl
    }
}

module.exports = {
    ethereum: {
        tvl,
    },
}