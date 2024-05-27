const { sumTokens2, } = require('../helper/unwrapLPs')

async function tvl(api) {
  
  return sumTokens2({ owners: [
    '0xb002b938d63fe8762f2a0eff9e49a8e20a0078e8',
  ], tokens: ['0xef63d4e178b3180beec9b0e143e0f37f4c93f4c2', '0xfe9f969faf8ad72a83b761138bf25de87eff9dd2', '0x9827431e8b77e87c9894bd50b055d6be56be0030', '0xfF204e2681A6fA0e2C3FaDe68a1B28fb90E4Fc5F', '0x07373d112edc4570b46996ad1187bc4ac9fb5ed0'], api, }) //wbtc and usdt
}
module.exports = {
  btr: { tvl, }
}
