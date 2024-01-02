const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const contracts = [
  '0xE3cbE3A636AB6A754e9e41B12b09d09Ce9E53Db3'
];

module.exports = {
  ethereum: { tvl: sumTokensExport({ owners: contracts, tokens: [ADDRESSES.ethereum.USDC] }) }
};
