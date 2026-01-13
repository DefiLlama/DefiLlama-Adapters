const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({ 
  avax: { factory: '0x1128F23D0bc0A8396E9FBC3c0c68f5EA228B8256', fromBlock: 59708285, },
  monad: { factory: '0x44805F92db5bB31B54632A55fc4b2B7E885B0e0e', fromBlock: 37771314, },
})