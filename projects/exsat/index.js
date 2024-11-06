const axios = require('axios');
const { sumTokens } = require("../helper/chain/bitcoin");
const { getConfig } = require('../helper/cache');

async function tvl(api) {
    const config = await getConfig('exsat', 'https://raw.githubusercontent.com/exsat-network/exsat-defillama/refs/heads/main/bridge-bitcoin.json');
    const custody_addresses = config['custody_addresses'];
    const custody_ids = config['custody_ids'];
    const owners = [...custody_addresses];

    for (let custody_id of custody_ids) {
        let lower_bound = null;
        let hasMore = true;

        while (hasMore) {
            const { data: response } = await axios.post('https://rpc-us.exsat.network/v1/chain/get_table_rows', {
                "json": true,
                "code": "brdgmng.xsat",
                "scope": custody_id,
                "table": "addrmappings",
                "lower_bound": lower_bound,
                "upper_bound": null,
                "index_position": 1,
                "key_type": "",
                "limit": "100",
                "reverse": false,
                "show_payer": true
            });

            const addrs = response.rows.map(row => row.data.btc_address);
            owners.push(...addrs);

            hasMore = response.more;
            lower_bound = response.next_key;
        }
    }

    return sumTokens({ owners });
}

module.exports = {
    methodology: 'TVL for the exSat Bridge represents the total balance in custody BTC addresses, reflecting BTC assets bridged to the exSat network.',
    bitcoin: {
        tvl,
    },
};
