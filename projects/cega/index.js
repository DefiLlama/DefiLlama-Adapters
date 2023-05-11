const evm = require("./evm");
const solana = require("./solana");

module.exports = {
  timetravel: false,
  ...evm,
  ...solana,
};