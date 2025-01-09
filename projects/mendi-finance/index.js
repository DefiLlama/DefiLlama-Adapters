const { compoundExports2 } = require("../helper/compound");
const { staking } = require("../helper/staking");

module.exports = {
  methodology:
    "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  linea: {
    ...compoundExports2({ comptroller: '0x1b4d3b0421dDc1eB216D230Bc01527422Fb93103'}),
    staking: staking(
      [
        "0x150b1e51738cdf0ccfe472594c62d7d6074921ca",
        "0xcf8dedcdc62317beaedfbee3c77c08425f284486",
      ],
      "0x43e8809ea748eff3204ee01f08872f063e44065f"
    ),
  },
};
