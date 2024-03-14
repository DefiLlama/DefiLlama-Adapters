const { compoundExports2, methodology, } = require('./helper/compound');

module.exports = {
  ethereum:compoundExports2({ comptroller: '0x1775286Cbe9db126a95AbF52c58a3214FCA26803',}),
  methodology,
}