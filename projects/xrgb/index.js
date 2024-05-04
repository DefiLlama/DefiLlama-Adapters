const { sumTokensExport } = require("../helper/chain/brc20");
const owner = 'bc1ptm05s4f6f8j78zhx62lzx0dep07f2597nlgeltmm4sjn5stdu6gq4sxg2w'

module.exports = {
  methodology: "XRGB as bridge,Unlock ERC404 on all chains",
  bitcoin: {
      tvl: sumTokensExport({ owner, blacklistedTokens: ['XRGB'] }),
  }
};