const { aaveExports } = require("../helper/aave");

module.exports = {
  ethereum: aaveExports("ethereum", undefined, undefined, [
    "0xCB5a1D4a394C4BA58999FbD7629d64465DdA70BC",
  ]),
  arbitrum: aaveExports("arbitrum", undefined, undefined, [
    "0xE76C1D2a7a56348574810e83D38c07D47f0641F3",
  ]),
};
