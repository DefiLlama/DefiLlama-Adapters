const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports } = require("../helper/compound");

module.exports = {
  hallmarks: [
    [1678190400, "Oracle Exploit"]
  ],
  methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets.",
  arbitrum: compoundExports('0xeed247Ba513A8D6f78BE9318399f5eD1a4808F8e', '0x0706905b2b21574DEFcF00B5fc48068995FCdCdf', ADDRESSES.arbitrum.WETH)
};
