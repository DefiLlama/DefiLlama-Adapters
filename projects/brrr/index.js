const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const NFT_CONTRACT = "0x58ebebd033dC43aa9ab41ff739C7052eB0A72cd7";

module.exports = {
  blast: {
    tvl: sumTokensExport({ owners: [NFT_CONTRACT], tokens: [ADDRESSES.null] }),
  },
  methodology: "Sum contract token balance",
};
