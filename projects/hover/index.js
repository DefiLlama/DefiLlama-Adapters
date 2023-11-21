const { compoundExports2 } = require('../helper/compound')

module.exports = {
  methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
  kava: compoundExports2({ comptroller: '0x3A4Ec955a18eF6eB33025599505E7d404a4d59eC', cether: '0xb51eFaF2f7aFb8a2F5Be0b730281E414FB487636' }),
}
