const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens');

const BBTC = '0xF5e11df1ebCf78b6b6D26e04FF19cD786a1e81dC'
const BBUSD = ADDRESSES.bouncebit.BBUSD

module.exports = {
  methodology: "Tracks BBTC and BBUSD in BounceBit Premium pools on Ethereum and BSC. BounceBit chain temporarily disabled due to RPC connectivity issues.",
  ethereum: {
    tvl: sumTokensExport({
      owners: ["0x1ddD6E5eA766511CC0f348DC8d17578a821B680F", "0xa2B283e4dbdFEA5461C36a59E3B94b3ef2883085"],
      tokens: [BBTC]
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x55a55e8b08b091bD0529bf1af05b69fF5291867D", "0xdAfd8591402c5E57DCa4B1b9e481c08548a2442E"],
      tokens: [BBTC, BBUSD]
    }),
  },
};
