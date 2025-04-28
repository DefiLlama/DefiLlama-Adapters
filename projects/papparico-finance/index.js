const { sumTokensExport } = require("../helper/unknownTokens");

const PPFT_TOKEN_CONTRACT = "0x59BAfb7168972EcCA5e395F7dA88e71eCe47a260";
const PPFT_MAIN_LP = "0xb036145476Ad16782eC05C7EC340D7e3cE6D09b7";

const STAKING_CONTRACT = "0x535503d5c23bCA9896383003A46A8AD6c9CB2fe2";
const SINGLE_STAKING_CONTRACT = "0xFc8d5d6B280BF5E8d8DB12d0fF8a0f7d1A6ECf78";
const VAULTS_CONTRACT = "0x828CC5D75594e4d0D072566cC07F64E863A0d11E";
const LP_MINING_CONTRACT = "0x3E35810A663c7eE28a0A6f6A0984146CbB163c6c";

const XPPFT_TOKEN = "0x961105dD9bE34B64A27251d72B6D8F086847bc1c";
const XPPFT_LP = "0xA99F134FC1e922Bc78Aa78c5897ce1eeF925b179";
const LP_MINING_CONTRACT_V2 = "0x2490AFBf1609119bB76E5e936f4ce4cBed815947";
const lps = [PPFT_MAIN_LP, XPPFT_LP];

module.exports = {
  cronos: {
    tvl: () => ({}),
    staking: sumTokensExport({
      owners: [STAKING_CONTRACT, SINGLE_STAKING_CONTRACT, VAULTS_CONTRACT,],
      tokens: [PPFT_TOKEN_CONTRACT, XPPFT_TOKEN],
      lps,
      useDefaultCoreAssets: true,
    }),
    pool2: sumTokensExport({
      owners: [LP_MINING_CONTRACT, LP_MINING_CONTRACT_V2],
      tokens: lps,
      useDefaultCoreAssets: true,
    }),
  }
};