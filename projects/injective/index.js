const sdk = require('@defillama/sdk')

const inj = '0xe28b3b32b6c345a34ff64674606124dd5aceca30'
const holder = '0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3'
async function tvl(_timestamp, ethBlock){
    return {
        [inj]: (await sdk.api.erc20.balanceOf({
            target: inj,
            owner: holder,
            block: ethBlock
        })).output
    }
}
// Note: There are other ERC20 tokens in the contract address as well, notably USDT and WETH.
module.exports = {
    tvl
}
