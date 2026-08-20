const { reservesTvl } = require('../coinbase-btc/reserves');

module.exports = {
  methodology: "XRP collateral backing CBXRP https://www.coinbase.com/en-in/cbxrp/proof-of-reserves",
  ripple: {
    tvl: reservesTvl('cbxrp'),
  },
};
