const { sumTokensExport } = require("./helper/unwrapLPs");

module.exports = {
    pulse: {
        tvl: sumTokensExport({ 
          tokensAndOwners: [
            // [tokenAddress, ownerContractAddress]
            ['0xefD766cCb38EaF1dfd701853BFCe31359239F305', '0x5726f36e62cf761332F5c655b68bc2E5D55ED083'],
            ['0xA1077a294dDE1B09bB078844df40758a5D0f9a27', '0xc4d4fb6cAD2931e65C0BF44b2A3fA9C598ADd37B'],\
            ['0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', '0x8615545328F1F6c8cefe8b48ad48c231731433ea'],
          ],
        }),
    }
};
