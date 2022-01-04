const sdk = require("@defillama/sdk");

const whbtc = "0xf19c3FAFB0171484d2301Af1838cB5C6Ea739dC4"
const wheth = "0x33827D2d2a0f4533AC26083E6eaAe71D417cbBA0"
const writeUSDC = "0xda0606037834f4279Dc590434231F1E01C468629"
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const wbtc = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

async function tvl(_timestamp, ethBlock) {
    const balances = {};
    const underlyingBalances = await sdk.api.abi.multiCall({
        calls: [{
            target: wbtc,
            params: whbtc
        },{
            target: weth,
            params: wheth
        },{
            target: usdc,
            params: writeUSDC
        }],
        block: ethBlock,
        abi: "erc20:balanceOf"
    });
    sdk.util.sumMultiBalanceOf(balances, underlyingBalances, true)

    return balances
}

module.exports = {
    ethereum: {
        tvl
    },
    tvl
}