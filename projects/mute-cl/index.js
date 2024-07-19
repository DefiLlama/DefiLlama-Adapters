
const { uniV3Export } = require('../helper/uniswapV3')

module.exports = {
  misrepresentedTokens: true,
  ...uniV3Export({
    era: { factory: '0x488A92576DA475f7429BC9dec9247045156144D3', fromBlock: 32830523},
  })
};
 