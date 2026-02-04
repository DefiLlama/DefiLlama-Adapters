const { compoundExports } = require('../helper/compound')

module.exports = {
  methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
  evmos: compoundExports("0x053841Bd1D291380726a007eA834Ecd296923260", "0x1cd248D72248A0618932F77093Dc4ceC9757759d")
}
