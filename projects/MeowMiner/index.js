const { sumTokensExport } = require("../helper/unknownTokens")
const MEOW_TOKEN_CONTRACT = '0x8aD25B0083C9879942A64f00F20a70D3278f6187';
const MEOW_MINER_CONTRACT = '0xc0F9a97E46Fb0f80aE39981759eAB4a61eE36459';
const LP_MEOW_WAVAX = "0xbbf8e4b9AD041edE1F5270CAf5b7B41F0e55f719"

module.exports = {
  methodology: 'counts the number of MEOW tokens in the Meow Miner contract.',
  start: '2024-03-13',
  avax: {
    tvl: sumTokensExport({ owner: MEOW_MINER_CONTRACT, tokens: [MEOW_TOKEN_CONTRACT], lps: [LP_MEOW_WAVAX], useDefaultCoreAssets: true, }),
  }
}