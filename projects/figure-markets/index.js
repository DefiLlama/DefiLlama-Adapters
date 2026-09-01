const { sumTokens2 } = require('../helper/unwrapLPs');
const { queryV1Beta1V2 } = require('../helper/chain/cosmos.js');
const { get } = require('../helper/http');

const figureMarketsExchangeID = '1'
const provenanceRpc = 'https://rpc.provenance.io'

const collateralizedAssets = [
    // Institutional USD.TRADING balance: https://api.provenance.io/cosmos/bank/v1beta1/balances/pb100ay24eh6t8mm87j9jkt7hg0daxyzzunjpwejcejcchqmcsq3haqfjzfnl/by_denom?denom=uusd.trading
    'uusd.trading',
    'pm.sale.pool.3dxq3fk9llvhrqqwhodiap', // YLDS HELOCs
    'pm.pool.asset.1y3flutqcyuf8duew1vj2g', // YLDS CBLs
    'pm.pool.asset.3hjz8rcr3pejdc3msntlvy' // YLDS HELOC+
]

const getBlockAtTimestamp = async (timestamp) => {
    const status = await get(`${provenanceRpc}/status`)
    const syncInfo = status.result.sync_info
    let low = { height: +syncInfo.earliest_block_height, time: Date.parse(syncInfo.earliest_block_time) / 1000 }
    let high = { height: +syncInfo.latest_block_height, time: Date.parse(syncInfo.latest_block_time) / 1000 }

    if (timestamp < low.time) throw new Error(`Provenance archive starts at ${syncInfo.earliest_block_time}`)
    if (timestamp >= high.time) return undefined

    while (high.height - low.height > 100) {
        const fraction = (timestamp - low.time) / (high.time - low.time)
        const height = Math.max(low.height + 1, Math.min(high.height - 1, Math.floor(low.height + fraction * (high.height - low.height))))
        const block = await get(`${provenanceRpc}/block?height=${height}`)
        const point = { height, time: Date.parse(block.result.block.header.time) / 1000 }
        if (point.time <= timestamp) low = point
        else high = point
    }

    return low.height
}

const getLockedTokens = async (api) => {
    const block = api.block ?? (api.timestamp < Date.now() / 1000 - 3600 ? await getBlockAtTimestamp(api.timestamp) : undefined)
    const commitments = await queryV1Beta1V2({
        chain: 'provenance',
        url: `exchange/v1/market/${figureMarketsExchangeID}/commitments`,
        limit: 1000,
        block,
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
    methodology: "Figure Markets TVL is the sum of tokens committed to the Figure Markets exchange, excluding USD.TRADING and collateralized pool assets.",
    provenance: { tvl },
}
