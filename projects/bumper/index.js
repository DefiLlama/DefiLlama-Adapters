const sdk = require('@defillama/sdk')

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const contract = "0xBabeE6d5F6EDD301B5Fae591a0D61AB702b359d0"
async function tvl(time, block) {
    return {
        [USDC]: (await sdk.api.abi.call({
            target: contract,
            block,
            abi: 'uint256:currentTVL'
        })).output
    }
}

module.exports = {
    methodology: `Count the USDC that has been deposited on ${contract}`,
    ethereum: {
        tvl,
    },
    hallmarks: [
        [1626264000, "LP Program Starts"],
        [1634212800, "LP Program Ended"],
        [1639656000, "Uniswap V3 Listing and Staking v1 Program starts"],
        [1658318400, "Alpha Testing"],
        [1677672000, "Uniswap V2 Listing and Liquidity Mining Program"],
    ]
}
