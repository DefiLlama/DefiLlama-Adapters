const { compoundExports } = require('../helper/compound')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
  evmos: compoundExports("0x053841Bd1D291380726a007eA834Ecd296923260", "evmos", "0x1cd248D72248A0618932F77093Dc4ceC9757759d", ADDRESSES.null, undefined, undefined, { fetchBalances: true, })
}
