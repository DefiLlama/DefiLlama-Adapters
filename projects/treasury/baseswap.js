const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xAF1823bACd8EDDA3b815180a61F8741fA4aBc6Dd";

module.exports = treasuryExports({
  base: {
    tokens: [ 
        nullAddress,
        "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", //USDbC
     ],
    owners: [treasury,],
  },
})