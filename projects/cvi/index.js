const sdk = require('@defillama/sdk')

const usdt = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const USDTPlatform = '0xe0437BeB5bb7Cf980e90983f6029033d710bd1da'
const ETHPlatform = "0x5005e8Dc0033E78AF80cfc8d10f5163f2FcF0E79"
async function tvl(_timestamp, ethBlock){
    return {
        [usdt]: (await sdk.api.erc20.balanceOf({
            target: usdt,
            owner: USDTPlatform,
            block: ethBlock
        })).output,
        [weth]: (await sdk.api.eth.getBalance({
            target: ETHPlatform,
            block: ethBlock
        })).output
    }
}

module.exports = {
    misrepresentedTokens: true,
    tvl
}