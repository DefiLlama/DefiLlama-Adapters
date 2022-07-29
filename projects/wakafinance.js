const { getUniTVL } = require("./helper/unknownTokens")

module.exports = {
  misrepresentedTokens: true,
  fantom:{
    tvl: getUniTVL({
      factory: '0xb2435253c71fca27be41206eb2793e44e1df6b6d',
      chain: 'fantom',
      coreAssets: [
        '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // wftm
        '0x04068da6c83afcfa0e13ba15a6696662335d5b75', // USDC
        '0x049d68029688eabf473097a2fc38ef61633a3c7a', // USDT
        '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e', // DAI
        // '0xf61cCdE1D4bB76CeD1dAa9D4c429cCA83022B08B', // WAKA
      ],
    }),
  },
}