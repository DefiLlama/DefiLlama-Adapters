const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokensExport } = require('../helper/unwrapLPs')

const FINX = "0xb6943825E461C6d8f2DDF17307C0571972f169FB";
const GENESIS_POOL = "0x0711c9f411FFc4Fe331256E83ee8C910a997A16a";
const USDC = ADDRESSES.arbitrum.USDC;
const WETH = ADDRESSES.arbitrum.WETH;

module.exports = {
    methodology: "Calculator USDC and WETH staked to genesis pool contract",
    arbitrum: {
        tvl: sumTokensExport({ owner: GENESIS_POOL, tokens: [USDC, WETH]})
    },
}
