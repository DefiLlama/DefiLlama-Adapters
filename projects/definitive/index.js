module.exports = {
  methodology: "For Hyperstaking, an onchain method calculates collateral + balance - debt. For LP, we can just calculate the value of LP tokens held in the vault"
}

Object.keys(CommunityVaultsLP).forEach(chain => {
  module.exports[chain] = { }
})