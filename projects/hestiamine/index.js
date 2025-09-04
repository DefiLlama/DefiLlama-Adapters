const vault = "0xC10aA720dFde56be6fB37F91189a64215a61ddc3";
const hestiaToken = "0xBC7755a153E852CF76cCCDdb4C2e7c368f6259D8";

module.exports = {
  base: {
    tvl: sumTokensExport({
      owners: [vault],
      tokens: [hestiaToken],
    }),
  },
};
