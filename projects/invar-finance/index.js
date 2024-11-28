const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs.js');

const INVARIA2222 = "0x10a92B12Da3DEE9a3916Dbaa8F0e141a75F07126";

module.exports = {
  methodology:
    "Counts the number of staking nfts time the unit price of nft",
  ethereum: {
    tvl: sumTokensExport({ owner:INVARIA2222, token: ADDRESSES.ethereum.USDC}),
  },
  deadFrom: '2023-11-12',
};
