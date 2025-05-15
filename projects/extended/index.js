const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const contracts = [
  '0x1cE5D7f52A8aBd23551e91248151CA5A13353C65'
];

module.exports = {
  ethereum: { tvl: sumTokensExport({ owners: contracts, tokens: [ADDRESSES.ethereum.USDC] }) }
};