const { reservesTvl } = require('../coinbase-btc/reserves');

module.exports = {
  methodology: "LTC collateral backing CBLTC. https://www.coinbase.com/en-sg/cbltc/proof-of-reserves",
  litecoin: {
    tvl: reservesTvl('cbltc'),
  },
};
