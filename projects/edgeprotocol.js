const retry = require('async-retry');
const axios = require("axios");

function getCoinGeckoId(apiId) {
    return {
        'terra14z56l0fp2lsf86zy3hty2z47ezkhnthtr9yq76': 'anchor-protocol',
        'terra15gwkyepfc6xgca5t5zefzwy42uts8l2m4g40k6': 'mirror-protocol',
        'terra17y9qkl8dfkeg4py7n0g5407emqnemc3yqk5rup': 'stader-lunax',
        'terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu': 'anchorust',
        'terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp': 'bonded-luna',
        'uluna': 'terra-luna',
        'uusd': 'terrausd'
    }[apiId]
};

async function tvl() {
    const balances = {};

    let response = (
        await retry(
            async bail => await axios.get('https://quicknode.edgeprotocol-finance.workers.dev/terra/wasm/v1beta1/contracts/terra1pcxwtrxppj9xj7pq3k95wm2zztfr9kwfkcgq0w/store?query_msg=eyJtYXJrZXRfbGlzdHMiOnt9fQ%3D%3D',
                {
                    headers: {
                        origin: 'https://app.edgeprotocol.io',
                        referer: 'https://app.edgeprotocol.io/'
                    }
                })
            )
        ).data.query_result;

    response.forEach(m => {
        balances[getCoinGeckoId(m.underlying)] = m.total_credit / 10 ** 6;
    });

    return balances;
};

module.exports = {
    terra: {
        tvl
    },
};