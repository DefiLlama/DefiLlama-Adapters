const { uniV3Export } = require('../helper/uniswapV3');

// Use the proven uniV3Export helper for V3 pools
const v3Config = {
  camp: { 
    factory: '0xBa08235b05d06A8A27822faCF3BaBeF4f972BF7d', 
    fromBlock: 1,
  }
};

module.exports = {
  ...uniV3Export(v3Config),
  methodology: 'TVL is calculated by summing the token balances in all SummitX V3 pools on Camp Network using the standard Uniswap V3 helper functions for accurate pricing.',
};
