const { sumTokens2, } = require('../helper/unwrapLPs')

async function tvl(api) {
  
  return sumTokens2({ owners: [
    '0x6a7821c654e5F8E890ECaa530D7dd744A177A774',
    '0xD904dF70A69e1550728DdF0659E06a6464b4127d',
    '0xcA98b38F0fFc98C4Ee7EDfe16D7d611528f1eEc2',
    
  ], tokens: ['0x7d2B7603234c7312976C6920f33A84531Ca40940'], api, }) //lslor
}

module.exports = {
  btr: { tvl, }
}
