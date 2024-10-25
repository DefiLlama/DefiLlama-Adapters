const http = require('../helper/http')
const { getEnv } = require('../helper/env')
const { sliceIntoChunks } = require('../helper/utils')

const endpoint = () => getEnv('SUI_RPC')

async function call(method, params, { withMetadata = false } = {}) {
    if (!Array.isArray(params)) params = [params]
    const {
        result
    } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method, params, })
    if (['suix_getAllBalances'].includes(method)) return result
    return withMetadata ? result : result.data
}

async function queryEvents({ eventType, transform = i => i }) {
    let filter = {}
    if (eventType) filter.MoveEventType = eventType
    const items = []
    let cursor = null
    do {
        const { data, nextCursor, hasNextPage } = await call('suix_queryEvents', [filter, cursor], { withMetadata: true, })
        cursor = hasNextPage ? nextCursor : null
        items.push(...data)
    } while (cursor)
    return items.map(i => i.parsedJson).map(transform)
}

async function getObjects(objectIds) {
    if (objectIds.length > 9) {
        const chunks = sliceIntoChunks(objectIds, 9)
        const res = []
        for (const chunk of chunks) res.push(...(await getObjects(chunk)))
        return res
    }
    const {
        result
    } = await http.post(endpoint(), {
        jsonrpc: "2.0", id: 1, method: 'sui_multiGetObjects', params: [objectIds, {
            "showContent": true,
        }],
    })
    return objectIds.map(i => result.find(j => j.data.objectId === i)?.data?.content)
}


async function tvl(api) {
    let events

    const eventType = '0xb61e324fa43746f5c24b2db3362afb382b644b32bce39a53f1f796a0109828e0::suimarket::EventCreated'

    events = await queryEvents({ eventType, transform: i => i.event_id })
    events = await getObjects(events)

    events.forEach(object => {
        const coin = object.type.split('<')[1].replace('>', '')
        const amount = object.fields.total_base_coin
        api.add(coin, amount)
    })
}


module.exports = {
    timetravel: false,
    sui: {
        tvl
    },
}
