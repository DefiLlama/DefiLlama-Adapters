const ADDRESSES = require('../helper/coreAssets.json')
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
    ADDRESSES.starknet.STRK,
    // ETH
    ADDRESSES.starknet.ETH,
    // USDC
    ADDRESSES.starknet.USDC,
    // USDT
    ADDRESSES.starknet.USDT,
    // DAI
    ADDRESSES.starknet.DAI,
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