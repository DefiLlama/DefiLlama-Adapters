const { aaveExports, methodology } = require('../helper/aave')

const CONFIG = {
  sonic: ['0x2ce2f663f8C8A011df0ACb1744b45108F61B9005'],
}

module.exports.methodology = methodology

Object.keys(CONFIG).forEach((chain) => {
  const poolDatas = CONFIG[chain];
  module.exports[chain] = aaveExports(undefined, undefined, undefined, poolDatas, { v3: true, })
})
module.exports.sonic.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 