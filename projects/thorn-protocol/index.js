const { info } = require("@defillama/sdk/build/erc20");
const { nullAddress } = require("../helper/tokenMapping");
const { sumTokensExport, sumTokens2 } = require("../helper/unwrapLPs");

async function tvl(api) {
    let target = "0x888099De8EA8068D92bB04b47A743B82195c4aD2";
    const pairLength = await api.call({
        target: target,
        abi: "function pairLength() view returns (uint256)",
    });
    const indices = Array.from({ length: pairLength }, (_, i) => i);
    const pairs = await api.multiCall({
        target: target,
        abi: "function swapPairContract(uint256) view returns (address)",
        calls: indices.map((i) => ({ params: i })),
    });
    return sumTokens2({
        api,
        owners: pairs,
        tokens: [nullAddress],
    });
}

module.exports = {
    methodology: "Uses factory(0x888099De8EA8068D92bB04b47A743B82195c4aD2) address find and price Liquidity Pool pairs",
    start: 1729159200,
    sapphire: {
        timetravel: false,
        tvl,
    },
};
