const { reservesTvl } = require('../coinbase-btc/reserves');

module.exports = {
  methodology: "ADA collateral backing CBADA https://www.coinbase.com/cbada/proof-of-reserves",
  cardano: {
    tvl: reservesTvl('cbada'),
  },
};
