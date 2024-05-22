const { sumTokens2, } = require('../helper/unwrapLPs')

async function tvl(api) {
  
return sumTokens2({ owners: [
    '0x97886860D6F569C02c7DFAcE8030EFB5052dF353',
  ], tokens: ['0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f'], api, }) //wbtc
}

module.exports = {
  btr: { tvl, }
}