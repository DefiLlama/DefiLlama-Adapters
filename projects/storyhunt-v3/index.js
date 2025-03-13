const { blacklistedTokens_default } = require('../helper/solana')
const { uniV3Export } = require('../helper/uniswapV3')
module.exports = uniV3Export({
  'sty': { factory: '0xa111dDbE973094F949D78Ad755cd560F8737B7e2', fromBlock: 1, blacklistedTokens: ["0x5fbdb2315678afecb367f032d93f642f64180aa3", "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"] }
})