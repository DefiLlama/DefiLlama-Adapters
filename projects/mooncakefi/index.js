const { aaveExports } = require("../helper/aave");

module.exports = {
  linea: aaveExports("linea", undefined, undefined, [
    "0x593C2d762B1CDe79101D946Ca7816eeaF17Ad744",
  ]),
  base: aaveExports("base", undefined, undefined, [
    "0x32aB5e8ad83d4afbEe7103d7ed4A9CAF7B76F195",
  ]),
};
