const { sumTokensExport } = require('../helper/sumTokens');

module.exports = {
  methodology: "Current TVL comprises of committed BTC and WBTC in the list of addresses we provided which are mapped 1:1 via our own protocol staking",
  ailayer: {
    tvl: sumTokensExport({
      owners: ["0x92067bd47a81e4A906165EdBa84CEFE290382871"],
      tokens: ["0xEAa3C2fa77c306592750C9220a8f52DA8A849Ede"] //bbtc
    }),
  }
};
