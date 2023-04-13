const { compoundExports2 } = require('./helper/compound');

module.exports = {
  ethereum:compoundExports2({ comptroller: '0x1775286Cbe9db126a95AbF52c58a3214FCA26803',}),
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.",
}