const evm = require("./evm")

module.exports = {
  doublecounted: true,
  ...evm,
  methodology: "Sums the totalBalance of all 3Jane Theta Vaults",
}
