const { compoundExports2 } = require('../helper/compound');

module.exports = {
  shimmer_evm: compoundExports2({ comptroller: '0xF7E452A8685D57083Edf4e4CC8064EcDcF71D7B7', }),
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted.",
}