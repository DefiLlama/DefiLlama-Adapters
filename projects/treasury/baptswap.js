
const { treasuryExports } = require("../helper/treasury");

const treasury = "0x6dc7c3b14905bff00bd58cce4b140b86f2bf4814bd72e8c95caec370ed5fe41c";

module.exports = treasuryExports({
  aptos: {
    owners: [treasury, ],
  },
});