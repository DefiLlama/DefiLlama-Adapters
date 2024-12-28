const { sumTokens } = require("../helper/chain/bitcoin");
const bitcoinBook = require('../helper/bitcoin-book');

async function tvl(api) {
    return sumTokens({ owners: await bitcoinBook.exsatBridge() });
}

module.exports = {
    methodology: 'TVL for the exSat Bridge represents the total balance in custody BTC addresses, reflecting BTC assets bridged to the exSat network.',
    bitcoin: { tvl },
};
