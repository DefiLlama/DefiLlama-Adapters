const sdk = require('@defillama/sdk')

const contract = "0x57A0B07dcD834cAbB844BEc8E7903A3B2faE6245"
const usdcToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
async function tvl(_timestamp, ethBlock){
    return {
        [usdcToken]: (await sdk.api.erc20.balanceOf({
            target: usdcToken,
            owner: contract,
            block: ethBlock
        })).output
    }
}

module.exports = {
    tvl
}