const { sumTokensExport } = require("../helper/unknownTokens")
const LAMA_TOKEN_CONTRACT = '0x89A8633bcaD3af0951acC5137811ea21a17C37DC';
const LAMA_STAKING_CONTRACT = '0xc16ce7B683da825906c6CA8Df33986c6Ef9B287B';
const LP_LAMA_WAVAX = "0xf3336be3416916D26840f41780E0cBc861eF3B3C";
const LP_LQDX_LAMA = "0x3a74922803415Dfc43c0030d47707b20f4c1b05d"

module.exports = {
  methodology: 'counts the number of LAMA tokens in the Lama Staking contract.',
  start: 1711962980,
  avax: {
    tvl: sumTokensExport({ owner: LAMA_STAKING_CONTRACT, tokens: [LAMA_TOKEN_CONTRACT], lps: [LP_LAMA_WAVAX, LP_LQDX_LAMA], useDefaultCoreAssets: true, }) 
  }
}