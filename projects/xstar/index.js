const { sumTokens2, } = require('../helper/unwrapLPs')

async function tvl(api) {
  
  return sumTokens2({ owners: [
    '0xFEc8a6cFaCbF3dA3E0c9988D59542eB6A5d49184',
  ], tokens: ['0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f', '0xfe9f969faf8ad72a83b761138bf25de87eff9dd2'], api, }) //wbtc and usdt
}

module.exports = {
  btr: { tvl, }
}