const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
    await getSolBalanceFromStakePool('8B9yuGU5SbXLE56k4yH2AfqbMXNEah7MJMbZKDPqg23X', api)
}

module.exports = {
    timetravel: false,
    solana: { tvl },
};