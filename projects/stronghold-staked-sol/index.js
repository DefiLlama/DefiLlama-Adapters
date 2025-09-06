const { getSolBalanceFromStakePool } = require('../helper/solana')

async function tvl(api) {
    await getSolBalanceFromStakePool('GZDX5JYXDzCEDL3kybhjN7PSixL4ams3M2G4CvWmMmm5', api)
}

module.exports = {
    timetravel: false,
    solana: { tvl },
};