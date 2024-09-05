const { get } = require('../helper/http')
const { RPC_ENDPOINT } = require('../helper/chain/tezos')

async function fetchWtzTvl() {
    const wtzContracts = [
        "KT1BB3oNr5vUSw1CuPNb2zpYEVp376XrXWaJ",
        "KT1H25LW5k4HQGm9hmNXzaxf3nqjsAEhQPah",
        "KT1LpGZnT6dj6STSxHXmvSPqx39ZdPXAMpFz", 
        "KT1NBgqqJacbdoeNAg9MvrgPT9h6q6AGWvFA",
        "KT1NGTDBKDPMrAYEufb72CLwuQJ7jU7jL6jD"
    ];

    // Use Promise.all to fetch all wtz contract balances concurrently
    const balances = await Promise.all(wtzContracts.map(async (contract) => {
        const balance = await get(RPC_ENDPOINT + `/v1/accounts/${contract}/balance`);
        return balance;
    }));

    const totalBalance = balances.reduce((total, balance) => total + balance, 0);
    return totalBalance;

}

async function tvl() {
    const wtzTvl = await fetchWtzTvl();
    return {
        tezos: wtzTvl / 1e6
    };
}

module.exports = {
    timetravel: false,
    tezos: {
        tvl
    }
};