const { compoundExports2, methodology, } = require('../helper/compound');

module.exports = {
  shimmer_evm: compoundExports2({ comptroller: '0xF7E452A8685D57083Edf4e4CC8064EcDcF71D7B7', }),
  methodology,
}