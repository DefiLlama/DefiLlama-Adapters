const { compoundExports } = require("./helper/compound");
const unitroller = "0x0cDD860ca594982443E737AC7A0B84f18C477E05";

module.exports = {
  base: compoundExports(unitroller),
  deadFrom: "2023-08-27"
};
module.exports.base.borrowed = () => ({}) // bad debt
