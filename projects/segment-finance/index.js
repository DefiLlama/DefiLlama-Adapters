const { compoundExports2 } = require("../helper/compound");
const { staking } = require("../helper/staking");

module.exports = {
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  op_bnb: {
    ...compoundExports2({
        comptroller: "0x71ac0e9A7113130280040d0189d0556f45a8CBB5",
        cether: "0x7e844423510A5081DE839e600F7960C7cE84eb82",
    }),
  },
  bsc: {
    ...compoundExports2({
        comptroller: "0x57E09c96DAEE58B77dc771B017de015C38060173",
        cether: "0x5fcea94b96858048433359bb5278a402363328c3",
    }),
    staking: staking(
      [
        "0xC6BcBe182b0F85dBfF6b49DC81CecEe02A16fE57",
      ],
      "0x5de40c1152c990492eaeaeecc4ecaab788bbc4fd",
      "bsc",
    ),
  },
};
