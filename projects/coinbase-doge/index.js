const { sumTokensExport } = require('../helper/sumTokens');

const DOGE_ADDRESSES = [
"DLuceb7v8vHknepvYRTzz5bSMUAqax8vTN",
"DCqkF26vcqG1FGJiB7L73jyTDeFkjeEPvJ",
"DNhLqkURqaQDW4f4J9wxtVzRw1XxhkjZ6m"
];

module.exports = {
  methodology: "DOGE collateral backing CBDOGE https://www.coinbase.com/en-nl/cbdoge/proof-of-reserves",
  doge: {
    tvl: sumTokensExport({ owners: DOGE_ADDRESSES }),
  },
};