const { compoundExports } = require("./helper/compound");
const { transformMetisAddress } = require("./helper/portedTokens");
const comptroller = "0x3fe29D7412aCDade27e21f55a65a7ddcCE23d9B3";

module.exports = {
  misrepresentedTokens: true,
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
