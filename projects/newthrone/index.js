const { sumTokensExport } = require("../helper/unknownTokens");

const GAME_CONTRACT = '0x61C3A357bc3ca51b80eCD36CB1Ae37e5465C6701'

module.exports = {
  methodology: 'THRO tokens in the Game contract, which represents the current balance of the game (total spent - total claimed).',
  base: {
    tvl: () => ({}),
    staking: sumTokensExport({ owner: GAME_CONTRACT, tokens: ['0x0f929C29dcE303F96b1d4104505F2e60eE795caC'], lps: ['0x3267afBDFA739D4039D03172A4a80e4bb91370b6'], useDefaultCoreAssets: true,}),
  }
}
