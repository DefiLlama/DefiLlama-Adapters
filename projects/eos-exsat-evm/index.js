const { post } = require('../helper/http')
const {sumTokens} = require("../helper/chain/bitcoin");
const bitcoinBook = require("../helper/bitcoin-book");

async function tvl() {
    return sumTokens({ owners: await bitcoinBook.exsatBridge() });
}

module.exports = {
    methodology: `EOS ExSAT EVM TVL is achieved by querying the total balance held in custody addresses on the BTC network that are bridged to the EOS ExSAT EVM network.`,
    eos: {
        tvl
    },
}
