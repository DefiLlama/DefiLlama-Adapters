const { compoundExports } = require("./helper/compound");
const { transformMetisAddress } = require("./helper/portedTokens");
const comptroller = "0x3fe29D7412aCDade27e21f55a65a7ddcCE23d9B3";

module.exports = {
  timeTravel: true,
  incentivized: true,
  misrepresentedTokens: true,
  methodology: `As in Compound Finance, TVL counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are counted as "Borrowed" TVL and can be toggled towards the regular TVL.`,
  metis: {
    ...compoundExports(
      comptroller,
      "metis",
      "0xcFd482DcE13cA1d27834D381AF1b570E9E6C6810",
      "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
      transformMetisAddress()
    ),
  },
};
