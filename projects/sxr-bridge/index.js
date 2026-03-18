const { sumTokens2 } = require("../helper/unwrapLPs");

const owners = ['0xa104C0426e95a5538e89131DbB4163d230C35f86', '0xB4968C66BECc8fb4f73b50354301c1aDb2Abaa91']
const SX = ['0xbe9f61555f50dd6167f2772e9cf7519790d96624', '0x99fe3b1391503a1bc1788051347a1324bff41452']

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners,
        blacklistedTokens: SX,
        fetchCoValentTokens: true,
      }),
    staking: (api) => sumTokens2({
      api,
      owners,
      tokens: SX
    })
  },
};