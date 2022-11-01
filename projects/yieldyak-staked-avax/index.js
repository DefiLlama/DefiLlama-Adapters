
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const gAVAX = require("../geode/abis/avax/gAVAX.json");
const yieldYak_id = "45756385483164763772015628191198800763712771278583181747295544980036831301432";

async function avax(timestamp, ethBlock, chainBlocks) {
    const chain = "avax";
    const block = chainBlocks[chain];

    const supply = (
        await sdk.api.abi.call({
            abi: gAVAX.abi.find((abi) => abi.name === "totalSupply"),
            params: [yieldYak_id],
            target: gAVAX.address,
            chain,
            block,
        })
    ).output;

    const price = (
        await sdk.api.abi.call({
            abi: gAVAX.abi.find((abi) => abi.name === "pricePerShare"),
            params: [yieldYak_id],
            target: gAVAX.address,
            chain,
            block,
        })
    ).output;

    const TotalBalance = BigNumber(supply).times(price).dividedBy(1e18);

    return {
        "avax:0x0000000000000000000000000000000000000000": TotalBalance
    };
}

module.exports = {
    start: 1658869201,
    misrepresentedTokens: false,
    methodology:
        "Total Supply and Underlying Price of the derivative is multiplied, resulting in number of staked Avax tokens.",
    timetravel: true,
    doublecounted: true,
    avax: {
        tvl: avax,
    },
};
