const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const owners = [
  '0x763ecd00eEA0CDAECBDF97d88c3e0fd5457eE5A0',
  '0x16BEDB2Ab2aEf9023ff2cbF0C78135cA120c03C6',
]

const tronOwners = [
  'TUuRXVc9r5NYVq9fQL5gHTMm85vr3nj9oo',
]

const ercOwners = [
  '0x1AAD4eDD86980a2E4Fd570E2cC7018A9D3Fc5535',
]

module.exports = {
  arbitrum: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.arbitrum.USDT] }) },
  polygon: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.polygon.USDT] }) },
  bsc: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.bsc.USDT] }) },
  mantle: { tvl: sumTokensExport({ owners, tokens: [ADDRESSES.mantle.USDT] }) },
  tron: { tvl: sumTokensExport({ owners: tronOwners, tokens: [ADDRESSES.tron.USDT] }) },
  ethereum: { tvl: sumTokensExport({ owners: ercOwners, tokens: [ADDRESSES.ethereum.USDT] }) },
};
