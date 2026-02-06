const { sumTokens2 } = require('../helper/unwrapLPs');

const AGGREGATOR_CONTRACT = '0xb3f2B217B024700b6B85bB0941d4958EF17214C1';

// Major Cronos tokens routed through the aggregator
const TOKENS = [
  '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23', // WCRO
  '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', // USDC
  '0x66e428c3f67a68878562e79A0234c1F83c208770', // USDT
  '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03', // VVS
  '0xd677944Df705924AF369d2FCcf4A989f343DbCDf', // FFTB
];

async function tvl(api) {
  return sumTokens2({
    api,
    owner: AGGREGATOR_CONTRACT,
    tokens: TOKENS,
  });
}

module.exports = {
  methodology: 'TVL is calculated by summing all tokens held by the Neptune Swap Aggregator contract. DCA support will be added in a future update.',
  cronos: {
    tvl,
  },
};