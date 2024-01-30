const { nullAddress } = require("../helper/tokenMapping")

async function tvl(_, _b, _cb, { api, }) {
    const tvl = await api.call({
        target: "0xfae103dc9cf190ed75350761e95403b7b8afa6c0",
        abi: "erc20:totalSupply"
    })
    return {
        [nullAddress]: tvl
    }
}

module.exports = {
    doublecounted: true,
    ethereum: {
        tvl,
    },
}