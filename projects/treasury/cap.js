const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, nullAddress, } = require('../helper/unwrapLPs')

const contracts = {
  "treasury": "0x283C41b726634fBD6B72aA22741B202DB7E56aaC",
  "treasuryV2": "0x1058AFe66BB5b79C295CCCE51016586949Bc4e8d",
};
const cap = "0x031d35296154279dc1984dcd93e392b1f946737b";
const usdc = ADDRESSES.arbitrum.USDC;

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [usdc, contracts.treasury],
        [nullAddress, contracts.treasury],
        [nullAddress, contracts.treasuryV2],
      ]
    }),
  }
};