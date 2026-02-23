const { uniV4HookExport } = require('../helper/uniswapV4')

const PUMPCLAW_HOOK_V4_ADDRESS = '0xe5bCa0eDe9208f7Ee7FCAFa0415Ca3DC03e16a90';

module.exports = {
    methodology: `Counts the value of tokens locked in Uniswap V4 pools created by the PumpClaw factory. All LP positions are permanently locked`,
    start: 1769932905,
    doublecounted: true,
    timetravel: false,
    base: {
        tvl: uniV4HookExport({ hook: PUMPCLAW_HOOK_V4_ADDRESS }),
    }
}
