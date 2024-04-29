const ADDRESSES = require('../helper/coreAssets.json')

const yieldYak_id = "45756385483164763772015628191198800763712771278583181747295544980036831301432";

async function avax(api) {

    const supply = await api.call({
        abi: "function totalSupply(uint256 id) view returns (uint256)",
        params: yieldYak_id,
        target: "0x6026a85e11bd895c934af02647e8c7b4ea2d9808",
    })

    const price = await api.call({
        abi: "function pricePerShare(uint256 _id) view returns (uint256)",
        params: yieldYak_id,
        target: "0x6026a85e11bd895c934af02647e8c7b4ea2d9808",
    })

    return {
        ["avax:" + ADDRESSES.null]: supply * price / 1e18
    };
}

module.exports = {
    start: 1658869201,
    methodology: "Total Supply and Underlying Price of the derivative is multiplied, resulting in number of staked Avax tokens.",
    doublecounted: true,
    avax: {
        tvl: avax,
    },
};
