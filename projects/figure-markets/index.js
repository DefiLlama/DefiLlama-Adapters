const { sumTokens2 } = require('../helper/unwrapLPs');
const { queryV1Beta1 } = require('../helper/chain/cosmos.js');

const paginationLimit = 1000;

const figureMarketsExchangeID = '1'

const lockedTokensQuery = (nextKey) =>
    `exchange/v1/market/${figureMarketsExchangeID}/commitments?pagination.limit=${
        paginationLimit
    }${
        nextKey ? `&pagination.key=${nextKey}` : ""
    }`;

const getLockedTokens = async (key, api) => {
    const nextTokens = await queryV1Beta1({
        chain: 'provenance',
        url: lockedTokensQuery(key)
    })
    nextTokens.commitments.map((c) =>
        c.amount.map((a) => {
            api.add(a.denom, a.amount)
        })
    );
    let nextKey = nextTokens.pagination.next_key;
    if (nextKey) {
        nextKey = nextKey.replace(/\+/g, "-").replace(/\//g, "_");
        return getLockedTokens(nextKey, api);
    }
};

const tvl = async (api) => {
    await getLockedTokens(null, api)
    return sumTokens2({ api })
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Figure Markets TVL is the sum of all tokens locked within the Figure Markets protocol contracts.",
    provenance: { tvl },
}