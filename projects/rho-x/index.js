const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

module.exports = {
    start: '2025-09-22', 
    ethereum: {
      tvl: sumTokensExport({
        owner: '0x7094D8cb2b02a3899caE5aF16e0cB00f8bcD1862', tokens: [
          nullAddress,
          ADDRESSES.ethereum.USDT,
          ADDRESSES.ethereum.USDC,
          '0x4274cD7277C7bb0806Bd5FE84b9aDAE466a8DA0a',
        ]
      })
    }
  };
  