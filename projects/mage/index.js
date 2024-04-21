const { methodology, usdCompoundExports } = require("../helper/compound");
const { mergeExports } = require("../helper/utils");

const mainHub = usdCompoundExports(
  "0xCE3bcCd2b0A457782f79000Be1b534C04B3F5aDD",
  "merlin",
  "0xe3b51f15dc086fba15426b8d42b4cd6feb46968e"
);

const merlinHub = usdCompoundExports(
  "0xe7464Caa3fD31A1A8B458a634e72F94A00695d17",
  "merlin"
);

module.exports = mergeExports([
  { methodology, merlin: mainHub },
  { merlin: merlinHub },
]);
