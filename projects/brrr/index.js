const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const NFT_CONTRACT = "0x47efb5793b3aa8e15808c6fa794e6d7c93394047";

module.exports = {
  blast: {
    tvl: sumTokensExport({ owners: [NFT_CONTRACT], tokens: [ADDRESSES.null] }),
  },
  methodology: "Sum contract token balance",
};
