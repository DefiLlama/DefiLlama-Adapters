const { sumTokens2 } = require('../helper/unwrapLPs');
const { queryV1Beta1V2 } = require('../helper/chain/cosmos.js');

const figureMarketsExchangeID = '1'

const collateralizedAssets = [
    'pm.sale.pool.3dxq3fk9llvhrqqwhodiap', // YLDS HELOCs
    'pm.pool.asset.1y3flutqcyuf8duew1vj2g', // YLDS CBLs
    'pm.pool.asset.3hjz8rcr3pejdc3msntlvy' // YLDS HELOC+
]

const getLockedTokens = async (api) => {
    const commitments = await queryV1Beta1V2({
        chain: 'provenance',
        url: `exchange/v1/market/${figureMarketsExchangeID}/commitments`,
        limit: 1000,
    })
    for (const c of commitments) {
        for (const a of c.amount) {
            if (!collateralizedAssets.includes(a.denom)) {
                api.add(a.denom, a.amount)
            }
        }
    }
};

const tvl = async (api) => {
    await getLockedTokens(api)
    return sumTokens2({ api })
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Figure Markets TVL is the sum of all tokens locked within the Figure Markets protocol contract.",
    provenance: { tvl },
}