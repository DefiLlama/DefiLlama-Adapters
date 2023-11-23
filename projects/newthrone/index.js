const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES= require("../helper/coreAssets.json");

const GAME_CONTRACT = '0x61C3A357bc3ca51b80eCD36CB1Ae37e5465C6701'

module.exports = {
  methodology: 'WETH tokens in the Game contract, which represents the current balance of the game (total spent - total claimed).',
  base: {
    tvl: sumTokensExport({ owner: GAME_CONTRACT, tokens: [ADDRESSES.base.WETH]}),
  }
}; 