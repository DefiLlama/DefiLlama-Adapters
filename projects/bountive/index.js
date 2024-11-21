const ADDRESSES = require('../helper/coreAssets.json')
const { bountiveTokenAbi } = require("./abi");
const { multiCall } = require('../helper/chain/starknet')

const bountiveTokens = [
    // BoSTRK: Bountive STRK
    "0x018e009bbb035c506234e7a8eca6a7229adfd59a278ba3845285d28b03ed6d53",
    // BoETH: Bountive ETH
    "0x02fcaebd41710024e25b6dc646a62acb6560125a699a3f695b6adb54a180aaee",
    // BoUSDC: Bountive USDC
    "0x028a88bf75f1b10dc8552051a56fbdc732084af514f6065f4c67ea6d50204720",
    // BoUSDT: Bountive USDT
    "0x0243d9a1cffc0b5ebbf549efd1232a96b1ef392fe595e91dd72103d5a8e7d847",
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