const axios = require('axios');
const { sumTokens } = require("../helper/chain/bitcoin");

async function tvl(api) {
    const { data: response } = await axios.post('https://rpc-us.exsat.network/v1/chain/get_table_rows', {
        json: true,
        code: "custody.xsat",
        scope: "custody.xsat",
        table: "custodies",
        limit: "100",
        show_payer: true
    });

    const owners = response.rows.map(row => row.data.btc_address);
    return sumTokens({ owners });
}

module.exports = {
    methodology: 'TVL is based on Bitcoin addresses in the exSat credit staking contract, summing their associated Bitcoin balances.',
    start: 1729684800,
    bitcoin: {
        tvl,
    },
};
