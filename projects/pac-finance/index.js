const { aaveExports } = require("../helper/aave");

// https://docs.pac.finance/developer/mainnet-addresses
module.exports = {
  blast: aaveExports("blast", undefined, undefined, ["0x742316f430002D067dC273469236D0F3670bE446",], { hasV2LPs: true }),
};
