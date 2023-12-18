const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0xdc400bbe0b8b79c07a962ea99a642f5819e3b712', tokens: [ADDRESSES.null] }),
  },
};
