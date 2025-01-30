const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  plume: aaveExports(undefined, '0x7b0Ed65C30bC84fbEd61bA6470CdF9e7aDa62c29'),
}