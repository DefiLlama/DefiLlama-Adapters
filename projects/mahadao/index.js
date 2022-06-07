const polygon = require("./polygon");
const bsc = require("./bsc");
const ethereum = require("./ethereum");

module.exports = {
  misrepresentedTokens: true,
  methodology: "Deposited collateral in loans used to mint ARTH",
  polygon,
  bsc,
  ethereum,
};
