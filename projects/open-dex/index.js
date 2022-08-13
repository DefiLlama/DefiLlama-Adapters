const { getUniTVL, sumUnknownTokens } = require("../helper/unknownTokens");
const sntNova = "0x657a66332a65b535da6c5d67b8cd1d410c161a08";
const odxToken = "0xe36118ccfa51e4caf750dfaeaf5c6cf250759acb";
const qsrToken = "0x356c044B99e9378C1B28A1cAb2F95Cd65E877F33";
const nUSD = "0x1F5396f254EE25377A5C1b9c6BfF5f44e9294fFF"
const dexFactory = "0x9550b0c83AD5a58898cD4267987Af67e7E52bF55";

module.exports = {
  nova: {
    tvl: getUniTVL({
      factory: dexFactory,
      chain: "nova",
      coreAssets: [
        sntNova,
        nUSD,
        odxToken,
        qsrToken
      ],
    }),
    staking: async (_, _b, { nova: block }) =>
    sumUnknownTokens({
        owners: [],
        tokens: [],
        lps: [],
        chain: "nova",
        block,
      }),
  },
}
