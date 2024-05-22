const { sumTokens2, } = require('../helper/unwrapLPs')

async function tvl(api) {
  
  return sumTokens2({ owners: [
    '0xcc92b570ef8117af0ed2ec294f635b70644f13ea',
  ], tokens: ['0xff2e016a79301633eae9395ca51aaeaf2dc0051a', '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f'], api, }) //gast and wbtc
}

module.exports = {
  btr: { tvl, }
}