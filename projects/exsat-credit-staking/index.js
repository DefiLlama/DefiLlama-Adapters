const { sumTokens } = require("../helper/chain/bitcoin");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvl() {
    return sumTokens({ owners: await bitcoinAddressBook.exsatCreditStaking() })
  }

module.exports = {
    methodology: 'TVL is based on Bitcoin addresses in the exSat credit staking contract, summing their associated Bitcoin balances.',
    start: '2024-10-23',
    bitcoin: { tvl },
};
