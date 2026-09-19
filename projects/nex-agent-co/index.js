const { sumTokensExport } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

const NEX_TREASURY_OWNER = '0xF47BdF9ADd81FF2130509ec564D3387072bA5726';

module.exports = {
  methodology: 'TVL is calculated by summing the Base USDC held in the official NEX treasury wallet.',
  base: {
    tvl: sumTokensExport({
      owner: NEX_TREASURY_OWNER,
      tokens: [ADDRESSES.base.USDC],
    }),
  },
};
