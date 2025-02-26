const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');
const MARKET_1155TECH_CONTRACT = '0x33b77fAf955Ed3eDAf939ae66C4D7a2D78bc30C6';

module.exports = {
  methodology: 'Value of all Keys across all art markets is TVL in the protocol',
  canto: {
    tvl: sumTokensExport({ owner: MARKET_1155TECH_CONTRACT, tokens: [ADDRESSES.canto.NOTE] })
  }
};