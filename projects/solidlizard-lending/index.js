const { compoundExports2 } = require("../helper/compound");
const { staking } = require("../helper/staking");

module.exports = {
  methodology:
    "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  arbitrum: {
    ...compoundExports2({ comptroller: '0x9FfBdfcc508e76ee2b719eF6218879E938eF056C'}),
    staking: staking(
      [
        "0x08153c4C19Cb438A3bdC6303aF962a30E9f5e0B1",
        "0x8082F587Ff2B24dadB2220026F4FCa9323Ed8080",
      ],
      "0xe6AF844d5740B6B297B6Dd7Fb2ce299Ee9E3d16F"
    ),
  },
};
