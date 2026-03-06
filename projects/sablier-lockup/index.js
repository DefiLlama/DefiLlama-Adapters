const evm = require("./evm");
const solana = require("./solana");

module.exports = {
  ...evm,
  ...solana
};