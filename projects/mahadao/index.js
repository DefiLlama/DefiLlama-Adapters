const polygon = require('./polygon');
const bsc = require('./bsc');


module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Deposited collateral in troves used to mint ARTH",
  polygon,
  bsc
};
