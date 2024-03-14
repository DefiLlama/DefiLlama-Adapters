const { nullAddress } = require("../helper/tokenMapping")

async function tvl(_, _b, _cb, { api, }) {
    const tvl = await api.call({
        target: "0x74a09653A083691711cF8215a6ab074BB4e99ef5",
        abi: "function calculateTVLs() public view returns (uint256[][] memory, uint256[] memory, uint256)"
    })
    return {
        [nullAddress]: tvl[2]
    }
}

module.exports = {
    doublecounted: true,
    ethereum: {
        tvl,
    },
}