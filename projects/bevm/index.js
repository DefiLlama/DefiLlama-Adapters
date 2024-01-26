const { sumTokensExport } = require("../helper/sumTokens");
const ADDRESSES = require("../helper/coreAssets.json");

module.exports = {
  methodology: "TVL counts tokens deposited in BEVM",
  //doublecounted: true,
  bitcoin: {
    tvl: sumTokensExport({
      owners: [
        "bc1p43kqxnf7yxcz5gacmqu98cr2r5gndtauzrwpypdzmsgp7n3lssgs5wruvy",
        "bc1p2s98z85m7dwc7agceh58j54le0nedmqwxvuuj4ex4mwpsv52pjxqkczev9",
      ],
    }),
  },
};
