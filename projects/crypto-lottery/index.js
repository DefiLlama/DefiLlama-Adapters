const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const CSC_POLYGON_AVALANCHE_CONTRACT = '0x80b313Be000c42f1f123C7FBd74654544818Ba7c';
const BSC_CONTRACT = '0xbB183c396392d08B5f4b19909C7Ce58f9c86F637';
const KCC_CONTRACT = '0xED6aDb0d3340005C24B90B810b47bd8648e20199';

module.exports = {
  methodology: "We count of smart contract balance in coins",
  csc: {
    tvl: sumTokensExport({ chain: 'csc', owner: CSC_POLYGON_AVALANCHE_CONTRACT, tokens: [nullAddress]}),
  },
  polygon: {
    tvl: sumTokensExport({ chain: 'polygon', owner: CSC_POLYGON_AVALANCHE_CONTRACT, tokens: [nullAddress] }),
  },
  bsc: {
    tvl: sumTokensExport({ chain: 'bsc', owner: BSC_CONTRACT, tokens: [nullAddress] }),
  },
  
  avax: {
    tvl: sumTokensExport({ chain: 'avax', owner: CSC_POLYGON_AVALANCHE_CONTRACT, tokens: [nullAddress] }),
  },

  kcc: {
    tvl: sumTokensExport({ chain: 'kcc', owner: KCC_CONTRACT, tokens: [nullAddress] }),
  },
}
