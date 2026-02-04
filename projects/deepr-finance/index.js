const { compoundExports2, methodology } = require("../helper/compound");

module.exports = {
  shimmer_evm: compoundExports2({
    comptroller: "0xF7E452A8685D57083Edf4e4CC8064EcDcF71D7B7",
  }),
  iotaevm: compoundExports2({
    comptroller: "0xee07121d97FDEA35675e02017837a7a43aeDa48F",
  }),
  methodology,
};
