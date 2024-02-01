const { compoundExports } = require("./helper/compound");
const unitroller = "0x0cDD860ca594982443E737AC7A0B84f18C477E05";

module.exports = {
  methodology:
    "Same as Compound Finance",
  base: {
    ...compoundExports(unitroller, "base"),
  },
};
