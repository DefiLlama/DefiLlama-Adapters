const { request, gql } = require("graphql-request");

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

const graphUrl = `https://mantle.terra.dev/`
const query = gql`
query ($poolQuery: String!) {
  markets: WasmContractsContractAddressStore(
    ContractAddress: "terra1pcxwtrxppj9xj7pq3k95wm2zztfr9kwfkcgq0w"
    QueryMsg: $poolQuery
  ) {
    Result
  },
}
`

async function getMarkets() {
    const { markets: { Result } } = await request(graphUrl, query, { poolQuery: JSON.stringify({ market_lists: {} }) })
    return Result
}

async function tvl() {
    const balances = {};
    const markets = await getMarkets()
    JSON.parse(markets).forEach(m => {
        balances[getCoinGeckoId(m.underlying)] = (m.total_credit - m.total_insurance) / 10 ** 6;
    });
    return balances;
};

async function borrowed() {
    const balances = {};
    const markets = await getMarkets()
    JSON.parse(markets).forEach(m => {
        balances[getCoinGeckoId(m.underlying)] = m.total_loan / 10 ** 6;
    });
    return balances;
};

module.exports = {
    timetravel: false,
    methodology: `We query Edge's Genesis Pool smart contracts to get the amount of assets deposited and borrowed, we then use Coingecko to price the assets in USD.`,
    terra: {
        tvl,
        borrowed
    },
};
