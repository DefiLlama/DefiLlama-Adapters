const { sumTokensExport } = require("../helper/chain/ton");

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the sum of live pool balances of Ton4You settlement jettons (T4U, USDT, etc.) held by the protocol pool contracts on TON. The adapter queries on-chain jetton balances for the configured pool addresses and excludes demo/test assets.",
  ton: {
    tvl: sumTokensExport({
      owners: [
        // t4u pool
        "EQDiCt_C2X2cWjHg6foV7Szkd2Qn_fv6bx6W2ij9EHT6qYdm",
        // brin pool
        "EQBvN444Zta0BrdDWooxZG2UefCdd-OA91qJO3zdN4BaiW7H",
        // usdt pool
        "EQCw94I3YBFkAW2wZYPvwGoBeWUmaBlbBZ7XgF85u79r2ssL",
      ],
      tokens: [
        // T4U master
        "EQA0nLHHeZrT1SwWrBd8N5_5CKXJQFL7CnPYDLLnw-sIqoBq",
        // BRIN master
        "EQAQfNrwhA5sEywrLTtsxpyQFeKRfEpLdZREZILP9z9iUjAH",
        // USDT master
        "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
      ],
    }),
  },
};
