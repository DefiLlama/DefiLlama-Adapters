const { karpatKeyTvl } = require('../helper/karpatkey');
const { sumTokensExport } = require('../helper/unknownTokens');

module.exports={
    ethereum:{
      tvl: async (api)=>karpatKeyTvl(api, "CoW DAO", "COW"),
      ownTokens: sumTokensExport({
        tokens: ["0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab"],
        owners: ["0xca771eda0c70aa7d053ab1b25004559b918fe662"],
      })
    }
  }