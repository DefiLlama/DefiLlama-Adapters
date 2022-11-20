const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const CSC_POLYGON_CONTRACT = '0x80b313Be000c42f1f123C7FBd74654544818Ba7c';
const BCS_CONTRACT = '0xbB183c396392d08B5f4b19909C7Ce58f9c86F637';

module.exports = {
  start: 14005585,
  methodology: "We count of smart contract balance in coins",
  csc: {
    tvl: sumTokensExport({ chain: 'csc', owner: CSC_POLYGON_CONTRACT, tokens: [nullAddress]}),
  },
  polygon: {
    tvl: sumTokensExport({ chain: 'polygon', owner: CSC_POLYGON_CONTRACT, tokens: [nullAddress] }),
  },
  bsc: {
    tvl: sumTokensExport({ chain: 'bsc', owner: BCS_CONTRACT, tokens: [nullAddress] }),
  }
}; 