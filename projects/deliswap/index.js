const { uniV4HookExport } = require('../helper/uniswapV4')

const DELI_HOOK_V4_ADDRESS = '0x570A48F96035C2874de1c0F13c5075A05683b0cc' // DeliHook

// I have excluded v2 tvl as it overlaps with bmx amm tvl that we have already listed
module.exports = {
    methodology: `TVL is calculated from liquidity in DeliSwap pools, which are hooks on Uniswap V4 PoolManager`,
    start: 1762559813, // Nov-07-2025 11:56:53 PM +UTC
    doublecounted: true,  // same is counted as uniswap v4 tvl
    timetravel: false,
    base: {
        tvl: uniV4HookExport({ hook: DELI_HOOK_V4_ADDRESS }),
    }
}
