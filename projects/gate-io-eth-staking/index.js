const { cexExports } = require("../helper/cex");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");
const { mergeExports, getStakedEthTVL } = require("../helper/utils");


module.exports = { ethereum: { tvl: getStakedEthTVL({ withdrawalAddresses: ['0x287a66c7d9cba7504e90fa638911d74c4dc6a147', '0xbcf03ce48091e6b820a7c33e166e5d0109d8e712', '0x7a3f9b7120386249528c93e5eb373b78e54d5ba9'], sleepTime: 20_000, size: 200, proxy: true }) } }
