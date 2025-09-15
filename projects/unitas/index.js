const { getTokenSupplies } = require('../helper/solana');

const TOKEN_MINT = '9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy';

async function tvl() {
    const supply = await getTokenSupplies([TOKEN_MINT]);
    return {
        'usd-coin': supply[TOKEN_MINT] / 1e6
    }
}

module.exports = {
    hallmarks: [
        [1747670400, "solana unitas launch"]
    ],
    timetravel: false,
    methodology: "Currently, tvl is composed of minted USDu",
    solana: {
        tvl
    }
}