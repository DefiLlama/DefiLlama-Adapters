const { sumTokensExport } = require("../helper/unwrapLPs");

const PPFT_TOKEN_CONTRACT = "0x59BAfb7168972EcCA5e395F7dA88e71eCe47a260";
const PPFT_MAIN_LP = "0xb036145476Ad16782eC05C7EC340D7e3cE6D09b7";

const STAKING_CONTRACT = "0x535503d5c23bCA9896383003A46A8AD6c9CB2fe2";
const SINGLE_STAKING_CONTRACT = "0xFc8d5d6B280BF5E8d8DB12d0fF8a0f7d1A6ECf78";
const VAULTS_CONTRACT = "0x828CC5D75594e4d0D072566cC07F64E863A0d11E";
const LP_MINING_CONTRACT = "0x3E35810A663c7eE28a0A6f6A0984146CbB163c6c";

module.exports = {
  start: 13406569,
  cronos: {
    tvl: () => ({}),
    staking: sumTokensExport({
      owners: [STAKING_CONTRACT, SINGLE_STAKING_CONTRACT, VAULTS_CONTRACT,],
      token: PPFT_TOKEN_CONTRACT,
    }),
    pool2: sumTokensExport({
      tokensAndOwners: [[PPFT_MAIN_LP, LP_MINING_CONTRACT],],
      resolveLP: true,
    }),
  }
};