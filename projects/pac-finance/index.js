const { aaveExports } = require("../helper/aave");

// https://docs.pac.finance/developer/mainnet-addresses
module.exports = {
  blast: aaveExports("blast", undefined, undefined, [
    "0x742316f430002D067dC273469236D0F3670bE446",
  ], { blacklistedTokens: ['0x9be8a40c9cf00fe33fd84eaedaa5c4fe3f04cbc3']}),
};
