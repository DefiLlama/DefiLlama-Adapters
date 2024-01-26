const { aaveExports } = require("../helper/aave");

module.exports = {
  era: aaveExports("era", undefined, undefined, [
    "0xB73550bC1393207960A385fC8b34790e5133175E",
  ]),
  manta: aaveExports("manta", undefined, undefined, [
    "0x67f93d36792c49a4493652B91ad4bD59f428AD15",
  ]),
};
