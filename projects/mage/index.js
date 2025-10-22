const { methodology, compoundExports2 } = require("../helper/compound");
const sdk = require('@defillama/sdk');
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([{
  merlin: compoundExports2({ comptroller: '0xCE3bcCd2b0A457782f79000Be1b534C04B3F5aDD', cether: '0xe3b51f15dc086fba15426b8d42b4cd6feb46968e' }),
  methodology,
}, {
  merlin: compoundExports2({ comptroller: '0xe7464Caa3fD31A1A8B458a634e72F94A00695d17', }),
}
])