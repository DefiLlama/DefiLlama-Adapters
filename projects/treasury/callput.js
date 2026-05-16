const { treasuryExports } = require("../helper/treasury");

const owners = [
  '0xF9Ba07Ba4aD84D6Af640ebf28E2B98c135a207A3'
]

module.exports = treasuryExports({
  base: { owners, },
})