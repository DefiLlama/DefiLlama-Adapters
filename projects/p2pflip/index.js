const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const TOKENS = [coreAssets.matchain.MAT, coreAssets.matchain.USDT, coreAssets.matchain.WBNB]
const P2PFLIP = ['0xb71348d7035bC86bbb82471d2963789863E64b60']

module.exports = {
    methodology: "",
    matchain: {
      tvl: sumTokensExport({ owners: P2PFLIP, tokens: [...TOKENS, coreAssets.null] }),
    },
  };
  