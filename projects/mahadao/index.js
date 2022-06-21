const polygon = require("./polygon"); 
const ethereum = require("./ethereum");
const bsc=require('./bsc')

module.exports = {
  misrepresentedTokens: true,
  methodology: "Deposited collateral in loans used to mint ARTH",
  polygon,
  ethereum,
  bsc
};
