const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const owners = [
  '0x763ecd00eEA0CDAECBDF97d88c3e0fd5457eE5A0',
  '0x16BEDB2Ab2aEf9023ff2cbF0C78135cA120c03C6',
  '0x60b4B5e9FAc430698faE838D83bb7941d0fce5A2',
]

module.exports = {
  arbitrum: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.arbitrum.USDT] }) },
  polygon: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.polygon.USDT] }) },
  bsc: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.bsc.USDT] }) },
  mantle: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.mantle.USDT] }) },
};
