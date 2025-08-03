const { compoundExports2 } = require('../helper/compound');

module.exports = {
  ethereum: compoundExports2({ comptroller: "0xcC53F8fF403824a350885A345ED4dA649e060369", cether: "0x2ccb7d00a9e10d0c3408b5eefb67011abfacb075"}),
};

module.exports.ethereum.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 