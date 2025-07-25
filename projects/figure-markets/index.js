const { get } = require("../helper/http")
const { sumTokens2 } = require('../helper/unwrapLPs');

const paginationLimit = 1000;

const commitmentsQuery = (nextKey) =>
    `https://rest.cosmos.directory/provenance/provenance/exchange/v1/market/1/commitments?pagination.limit=${
        paginationLimit
    }${
        nextKey ? `&pagination.key=${nextKey}` : ""
    }`;

/**
 * Tokens are committed to Provenance's Exchange Module in order to conduct
 * decentralized exchanges. This functions accumulates a an object of committed
 * denoms and the amount within the Provenance Exchange Module.
 */
const getCommittedTokens = async (key, api) => {
    // Retrieve all the commitments across all markets
    const nextTokens = await get(commitmentsQuery(key));
    // Update the accumulator with each denom in the commitments
    nextTokens.commitments.map((c) =>
        c.amount.map((a) => {
            api.add(a.denom, a.amount)
        })
    );
    let nextKey = nextTokens.pagination.next_key;
    if (nextKey) {
        // convert base64 to URL-safe pagination key. We aren't using 
        // Buffer here because base64url removes padding.
        nextKey = nextKey.replace(/\+/g, "-").replace(/\//g, "_");
        return getCommittedTokens(nextKey, api);
    }
};

// Scopes holding the pool metadata
const demoPrimePools = [
    "scope1qp4lyqj9xkp570uj9l0sf6vhh46q599mcf",
    "scope1qpjqqp93nfn537acqgl6aauhj6ws8xk5ug",
    "scope1qq4ghl8h8dv5ugdyty66acmsc0ksld5llq",
    "scope1qqq6xkv4g9y50649l0r96us54aasd4ur5l",
    "scope1qz6rjfu4ympyxs5wd2nzpa3z0t7s0tw3ud",
    "scope1qz8xvt4mckfyssyln509g5ck3ejs7aq9yc",
    "scope1qzh44upjuvzyh25usrsl6w3rv9yqxs9w6n",
]

// Endpoint to retrieve the pool details
const recordsEndpoint = (scopeId) => 
    `https://rest.cosmos.directory/provenance/provenance/metadata/v1/scope/${scopeId}/record/pool-details`

// This is the loan pool contract on Figure Markets Exchange
const figureMarketsExchangePool = 'pm.sale.pool.3dxq3fk9llvhrqqwhodiap'

// Loan pools are also locked in the protocol. If a collateral value exists, we want to pull that as well
const getPoolsCollateralValue = async (api) => {
    const collateralTotal = (await Promise.all(demoPrimePools.map(async pool => {
        const poolHash = (await get(recordsEndpoint(pool))).records[0]?.record?.outputs[0]?.hash
        if (poolHash) {
            return JSON.parse(poolHash).collateralValue
        }
    }))).reduce((acc, cur) => acc += cur || 0, 0)
    api.add(figureMarketsExchangePool, collateralTotal)
}

const tvl = async (api) => {
    await getCommittedTokens(null, api)
    await getPoolsCollateralValue(api)
    return sumTokens2({ api })
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Figure Markets TVL is calculated by the tokens committed in the Provenance Exchange module.",
    provenance: { tvl },
}
