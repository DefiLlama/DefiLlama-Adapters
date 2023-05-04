
const { sumTokensExport } = require('../helper/unwrapLPs')

const FINX = "0xb6943825E461C6d8f2DDF17307C0571972f169FB";
const GENESIS_POOL = "0x0711c9f411FFc4Fe331256E83ee8C910a997A16a";
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

module.exports = {
    methodology: "Calculator USDC and WETH staked to genesis pool contract",
    arbitrum: {
        tvl: sumTokensExport({ owner: GENESIS_POOL, tokens: [USDC, WETH]})
    },
}
