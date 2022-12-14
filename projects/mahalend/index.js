const { aaveExports, } = require("../helper/aave");

const protocolDataHelper = "0xCB5a1D4a394C4BA58999FbD7629d64465DdA70BC";

module.exports = {
  ethereum: aaveExports("ethereum", undefined, undefined, [protocolDataHelper]),
};