const { uniV3Export } = require('../helper/uniswapV3');
const { mergeExports } = require('../helper/utils');

// V3 adapters (standard - OMNI now priced automatically!)
const v3 = uniV3Export({
  bsc:      { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 54053000 },
  arbitrum: { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 357770000 },
  avax:     { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 65460000 },
  base:     { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 32873000 },
  optimism: { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 138469000 },
  sonic:    { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 38533000 },
  plasma:    { factory: '0xd6Ab0566e7E60B67c50AC73ddFf4e3DdcB829EC2', fromBlock: 2531200 },
});

// Export merged adapters
module.exports = mergeExports([v3]);