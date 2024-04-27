const { bountiveTokenAbi } = require("./abi");
const { multiCall } = require('../helper/chain/starknet')

const bountiveTokens = [
    // BoSTRK: Bountive STRK
    "0x05a0fff20829d60a0cdae2da18a32bd3de5c32f8d0109d2a0b59a88a7a77176e",
    // BoETH: Bountive ETH
    "0x00d91e36ff68918b392c9cfc2e3f575526f69e04b97eb28142856fae3611fcf7",
    // BoUSDC: Bountive USDC
    "0x04ed6784fa5c11889851c2d13bbd80464e55605a90b5b664f9400df0fd6ef4a5",
    // BoUSDT: Bountive USDT
    "0x0753dc6f8fee7487fe3f32728c0f1af9df1f7a3d0443ef507eb79a974697be12",
    // BoDAI: Bountive DAI
    "0x06e32d47c49efb0243da8d456dc413f1dcf50ceea7be28ef520492eccfff2b43",
]

const underlyingsTokens = [
    // STRK
    "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    // ETH
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    // USDC
    "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    // USDT
    "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    // DAI
    "0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3",
]

async function tvl(api) {
    const supplied = await multiCall({
        calls: bountiveTokens,
        abi: bountiveTokenAbi.total_supply,
    });
    api.addTokens(underlyingsTokens, supplied)

}
  
module.exports = {
    methodology: 'TVL is the total tokens deposited on Bountive',
    starknet: {
        tvl,
    }
}; 