const { call } = require("../helper/chain/elrond");

const wrappedTaoContractAddress =
    "erd1qqqqqqqqqqqqqpgqajq8kvm8qq045s2fvj4sa7dph8kpqx9d78ssxjzjdh";
const wtao = "WTAO-4f5363";

const TREASURY_ADDRESS = "5HZAAREPzwBc4EPWWeTHA2WRcJoCgy4UBk8mwYFWR5BTCNcT";
const tao = "TAO";

const TAO_STATS_SUBQUERY =
    "https://api.subquery.network/sq/TaoStats/bittensor-indexer";

const tvl = async (api) => {
    const totalSupply = await call({
        target: wrappedTaoContractAddress,
        abi: "getTokenSupply",
        responseTypes: ["number"],
    });
    api.addTokens([wtao], [totalSupply.toString()]);
};
const taoQuery = async () => {
    const query = `{
        query{
            account(id: "${TREASURY_ADDRESS}"){
                id
                nodeId
                balanceTotal
                balanceStaked
                balanceFree
                address
            }
        }
    }`;

    const variables = {};

    const response = await fetch(TAO_STATS_SUBQUERY, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    return await response.json();
};

module.exports = {
    timetravel: false,
    bittensor: {
        tvl: async (api) => {
            return taoQuery().then((walletBalanceResponse) => {
                const totalBalance =
                    walletBalanceResponse.data.account.balanceTotal;
                return api.addTokens([tao], [totalBalance]);
            });
        },
    },
    elrond: {
        tvl,
    },
};
