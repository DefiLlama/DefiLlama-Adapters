const { aaveExports } = require("../helper/aave");

const config = {
  optimism: {
    dataProvider: '0xCC61E9470B5f0CE21a3F6255c73032B47AaeA9C0',
  },
  base: {
    dataProvider: '0x1566DA4640b6a0b32fF309b07b8df6Ade40fd98D',
  }
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = aaveExports(chain, undefined, undefined, [config[chain].dataProvider], { v3: true });
});