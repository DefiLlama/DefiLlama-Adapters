const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
    await getSolBalanceFromStakePool('pyZMBjpWsVjKANAYK5mpNbKiws2krjRPZ2N2UYCSnbP', api)
}

module.exports = {
    timetravel: false,
    solana: { tvl },
};