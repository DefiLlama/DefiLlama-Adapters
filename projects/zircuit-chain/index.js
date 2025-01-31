const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: (api) => 
      sumTokens2({
        api,
        owners: ['0x17bfAfA932d2e23Bd9B909Fd5B4D2e2a27043fb1', '0x386B76D9cA5F5Fb150B6BFB35CF5379B22B26dd8'],
        fetchCoValentTokens: true,
        permitFailure: true, 
        blacklistedTokens: ['0xfd418e42783382e86ae91e445406600ba144d162']
      }),
      staking: (api) => sumTokens2({
        api, owner: '0x386B76D9cA5F5Fb150B6BFB35CF5379B22B26dd8', token: '0xfd418e42783382e86ae91e445406600ba144d162', 
      })
  },
};
