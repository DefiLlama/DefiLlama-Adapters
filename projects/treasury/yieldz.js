const { treasuryExports } = require("../helper/treasury");

const treasury = "0x79Af6AbA700CCe35f5Ad5573a679674593fC6f0C";

module.exports = treasuryExports({
  ethereum: {owners: [treasury]},
  arbitrum: {owners: [treasury]},
  base: {owners: [treasury]},
  hyperliquid: {owners: [treasury]},
})
