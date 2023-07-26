const { aaveExports } = require("../helper/aave");

module.exports = {
  era: aaveExports("era", undefined, undefined, [
    "0xB73550bC1393207960A385fC8b34790e5133175E",
  ]),
};
