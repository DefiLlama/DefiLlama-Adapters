
const { compoundExports2 } = require("../helper/compound");
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([{
  mode: compoundExports2({ comptroller: '0xfb3323e24743caf4add0fdccfb268565c0685556' })
}, {
  mode: compoundExports2({ comptroller: '0x8fb3d4a94d0aa5d6edaac3ed82b59a27f56d923a' })
  }, {
    base: compoundExports2({ comptroller: '0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13' })
  }, {
    bob: compoundExports2({ comptroller: '0x9cFEe81970AA10CC593B83fB96eAA9880a6DF715' })
  }, {
    fraxtal: compoundExports2({ comptroller: '0xB5141403e811fFFE02f4d49Ea8d4a7B0b9590658' })
}])