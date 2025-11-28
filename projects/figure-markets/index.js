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

// Contracts holding the pool collateral
const demoPrimePools = [
    "scope1qp4lyqj9xkp570uj9l0sf6vhh46q599mcf",
    "scope1qpjqqp93nfn537acqgl6aauhj6ws8xk5ug",
    "scope1qq4ghl8h8dv5ugdyty66acmsc0ksld5llq",
    "scope1qqq6xkv4g9y50649l0r96us54aasd4ur5l",
    "scope1qz6rjfu4ympyxs5wd2nzpa3z0t7s0tw3ud",
    "scope1qz8xvt4mckfyssyln509g5ck3ejs7aq9yc",
    "scope1qzh44upjuvzyh25usrsl6w3rv9yqxs9w6n",
]

const collateralizedAssets = 'pm.sale.pool.3dxq3fk9llvhrqqwhodiap'

const getPoolsCollateralValue = async (api) => {
    const collateralTotal = (await Promise.all(demoPrimePools.map(async pool => {
        const poolHash = (await queryV1Beta1({
            chain: 'provenance',
            url: `metadata/v1/scope/${pool}/record/pool-details`
        })).records[0]?.record?.outputs[0]?.hash
        if (poolHash) {
            const poolInfo = JSON.parse(poolHash)
            if (poolInfo.leveragePool.collateralAssets.length > 0 && poolInfo.leveragePool.collateralAssets[0] === collateralizedAssets) {
                return poolInfo.collateralValue
            }
        }
    }))).reduce((acc, cur) => acc += cur || 0, 0)
    api.add(collateralizedAssets, collateralTotal)
}

const tvl = async (api) => {
    await getLockedTokens(null, api)
    await getPoolsCollateralValue(api)
    return sumTokens2({ api })
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Figure Markets TVL is the sum of all tokens locked within the Figure Markets protocol contracts.",
    provenance: { tvl },
}