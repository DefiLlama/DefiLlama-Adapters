const ADDRESSES = require('../helper/coreAssets.json')
const { graphQuery } = require('../helper/http')
const { getEnv } = require('../helper/env')
const { parseStructTag, toU64 } = require('../helper/chain/sui')
const { sliceIntoChunks } = require('../helper/utils')
const { SCALE, mul, positionValue } = require('./math')

// Production afLP vault after the relaunch.
const VAULT = '0x294d0b728cb56759a6686ea0ca672a8f7e66f84f0a426a490377ed939f0ef604'
const ACCOUNT = '0x5df4a7bb4604261e9b3d0efcc713307aae6591e2bfaca93fdaacb3c6e5da78e5'
const PERPS_PACKAGE = '0x3ec740df8428aa9c93aaef7f8cc1542ac3194fd014826b51bfe245346d64efc7'
const ORACLE_PACKAGE = '0x9237337d846fc90b0a7acbdee4ab91809298691873d28e1d64d91e6303ff6ba4'
const CONTENTS = 'asMoveObject { contents { json type { repr } } }'

/** Read a required Move object, retaining its type for collateral validation. */
function contents(object) {
    if (!object?.asMoveObject?.contents) throw new Error('Missing Aftermath on-chain object')
    return object.asMoveObject.contents
}

/** Select the market's configured oracle source; prices use 18 decimal places. */
function priceFeed(oracles, storageId, sourceId) {
    const feed = oracles.get(storageId)?.feeds.find(feed => feed.source_id === sourceId)
    if (!feed || BigInt(feed.price) <= 0n || BigInt(feed.twap_price) <= 0n)
        throw new Error(`Missing or invalid Aftermath oracle ${storageId}/${sourceId}`)
    return feed
}

/**
 * Calculate afLP NAV from its account, positions and oracle feeds at one Sui checkpoint.
 * Uses the latest recorded on-chain prices, including when a market is paused.
 * @param {import('@defillama/sdk').ChainApi} api - Sui TVL balance accumulator.
 * @returns {Promise<void>}
 * @throws {Error} If a required object, position or oracle feed cannot be read.
 */
async function tvl(api) {
    const endpoint = getEnv('SUI_GRAPH_RPC')
    const { checkpoint } = await graphQuery(endpoint, `{
        checkpoint {
            sequenceNumber
            query {
                vault: object(address: "${VAULT}") { ${CONTENTS} }
                account: object(address: "${ACCOUNT}") { ${CONTENTS} }
                clock: object(address: "0x6") { ${CONTENTS} }
            }
        }
    }`)
    const vault = contents(checkpoint.query.vault)
    const account = contents(checkpoint.query.account)
    const now = BigInt(contents(checkpoint.query.clock).json.timestamp_ms)
    const collateral = parseStructTag(vault.type.repr).typeParams[1]
    if (collateral !== ADDRESSES.sui.USDC_CIRCLE || parseStructTag(account.type.repr).typeParams[0] !== collateral)
        throw new Error('Unexpected collateral coin type for the Aftermath afLP vault')

    // Pin subsequent pages and position reads to the same checkpoint.
    const oracles = new Map()
    let after = null
    do {
        const result = await graphQuery(endpoint, `query ($checkpoint: UInt53!, $after: String) {
            checkpoint(sequenceNumber: $checkpoint) {
                query {
                    objects(first: 50, after: $after, filter: { type: "${ORACLE_PACKAGE}::price_feed_storage::PriceFeedStorage" }) {
                        nodes { ${CONTENTS} }
                        pageInfo { hasNextPage endCursor }
                    }
                }
            }
        }`, { checkpoint: checkpoint.sequenceNumber, after })
        const page = result.checkpoint.query.objects
        for (const object of page.nodes) {
            const oracle = contents(object).json
            if (oracles.has(oracle.storage_id)) throw new Error('Duplicate Aftermath oracle storage ID')
            oracles.set(oracle.storage_id, oracle)
        }
        after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
    } while (after)

    const params = vault.json.vault_params
    const collateralPrice = priceFeed(oracles, params.collateral_storage_id, params.collateral_source_id)
    let total = mul(BigInt(account.json.collateral) * BigInt(params.scaling_factor), BigInt(collateralPrice.price))
    const positionKey = Buffer.from(toU64(account.json.account_id)).toString('base64')
    const marketIds = [...new Set(vault.json.ch_ids)]
    for (const ids of sliceIntoChunks(marketIds, 50)) {
        const keys = ids.map(address => `{ address: "${address}" }`).join(', ')
        const result = await graphQuery(endpoint, `query ($checkpoint: UInt53!, $key: Base64!) {
            checkpoint(sequenceNumber: $checkpoint) {
                query {
                    multiGetObjects(keys: [${keys}]) {
                        ${CONTENTS}
                        dynamicField(name: { type: "${PERPS_PACKAGE}::keys::PositionKey", bcs: $key }) {
                            contents { json }
                        }
                    }
                }
            }
        }`, { checkpoint: checkpoint.sequenceNumber, key: positionKey })
        for (const object of result.checkpoint.query.multiGetObjects) {
            const market = contents(object)
            if (parseStructTag(market.type.repr).typeParams[0] !== collateral)
                throw new Error('Unexpected collateral coin type for an Aftermath market')
            const position = object.dynamicField?.contents?.json?.value
            if (!position) throw new Error(`Missing afLP position in market ${market.json.id}`)
            const core = market.json.market_params.core_params
            total += positionValue(
                position, market.json,
                priceFeed(oracles, core.base_storage_id, core.base_source_id),
                priceFeed(oracles, core.collateral_storage_id, core.collateral_source_id),
                now,
            )
        }
    }
    api.addUSDValue(Number(total) / Number(SCALE))
}

module.exports = {
    methodology: "Calculates afLP NAV from idle USDC collateral and deployed positions on Sui, including unrealized PnL and funding. All balances and oracle prices are read at the same checkpoint.",
    timetravel: false,
    sui: {
        tvl,
    }
}
