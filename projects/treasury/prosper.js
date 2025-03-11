const { nullAddress, treasuryExports } = require("../helper/treasury");
const { sumTokensExport } = require('../helper/sumTokens');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

const treasury = "0xb3BbCBd70436c9CAdDf52E2F06732f81DaC1F127";

const pros_token = "0x915424Ac489433130d92B04096F3b96c82e92a9D"; // PROS token

module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        pros_token
     ],
    owners: [treasury],
  },
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.prosper }),
  },
})
