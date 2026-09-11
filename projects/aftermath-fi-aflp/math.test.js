const assert = require('node:assert/strict')
const { test } = require('node:test')
const { SCALE, signed, mul, markPrice, positionValue } = require('./math')

/** Encode an integer as the on-chain unsigned representation of signed IFixed. */
const fixed = value => BigInt.asUintN(256, BigInt(value) * SCALE).toString()

/** A $100 index with $101 funding price, $102 TWAP price and $103 book price. */
function fixture() {
    return {
        market: {
            market_params: {
                core_params: { scaling_factor: '1000000000000' },
                twap_params: { funding_frequency_ms: '3600000', funding_period_ms: '28800000' },
            },
            market_state: {
                funding_last_upd_ms: '0', premium_twap: fixed(16), spread_twap: fixed(2),
                cum_funding_rate_long: fixed(3), cum_funding_rate_short: fixed(7),
            },
            orderbook: { best_ask_price: '104000000000', best_bid_price: '102000000000' },
        },
        feed: { price: fixed(100), twap_price: fixed(100) },
        collateralFeed: { price: '990000000000000000' },
        position: {
            collateral: fixed(100), base_asset_amount: fixed(2), quote_asset_notional_amount: fixed(180),
            cum_funding_rate_long: fixed(2), cum_funding_rate_short: fixed(6), pending_orders: '1',
        },
        now: 1800000n,
    }
}

test('signed u256 decoding and negative multiplication truncate towards zero', () => {
    assert.equal(signed(fixed(-2)), -2n * SCALE)
    assert.equal(signed(((1n << 256n) - 1n).toString()), -1n)
    assert.equal(signed((1n << 255n).toString()), -(1n << 255n))
    assert.equal(mul(-3n, SCALE / 2n), -1n)
    assert.equal(mul(3n, SCALE / 2n), 1n)
})

test('mark price selects the median, including a negative funding premium', () => {
    const { market, feed, now } = fixture()
    assert.equal(markPrice(market, feed, now), 102n * SCALE)
    market.orderbook = { best_ask_price: '100000000000', best_bid_price: '100000000000' }
    assert.equal(markPrice(market, feed, now), 101n * SCALE)
    market.market_state.premium_twap = fixed(-16)
    assert.equal(markPrice(market, feed, now), 100n * SCALE)
})

test('overdue funding clamps remaining time to zero', () => {
    const { market, feed } = fixture()
    market.orderbook = { best_ask_price: '99000000000', best_bid_price: '99000000000' }
    assert.equal(markPrice(market, feed, 3600000n), 100n * SCALE)
    assert.equal(markPrice(market, feed, 7200000n), 100n * SCALE)
})

test('book midpoint rounds before scaling and a missing side uses the index', () => {
    const { market, feed, now } = fixture()
    market.orderbook = { best_ask_price: '101000000002', best_bid_price: '101000000001' }
    assert.equal(markPrice(market, feed, now), 101n * SCALE + 1000000000n)
    feed.price = '101500000000000000000'
    market.orderbook.best_bid_price = null
    assert.equal(markPrice(market, feed, now), 1015n * SCALE / 10n)
})

test('long NAV includes USDC depeg, unrealized PnL and the long funding rate', () => {
    const { market, feed, collateralFeed, position, now } = fixture()
    // $99 collateral + (2 * $102 - $180) PnL - $2 funding = $121.
    assert.equal(positionValue(position, market, feed, collateralFeed, now), 121n * SCALE)
})

test('short NAV decodes signed notional and uses the short funding rate', () => {
    const { market, feed, collateralFeed, position, now } = fixture()
    position.base_asset_amount = fixed(-2)
    position.quote_asset_notional_amount = fixed(-220)
    // $99 collateral + (-2 * $102 + $220) PnL + $2 funding = $117.
    assert.equal(positionValue(position, market, feed, collateralFeed, now), 117n * SCALE)
})

test('losses are floored per position without subtracting from other positions', () => {
    const { market, feed, collateralFeed, position, now } = fixture()
    const loss = { ...position, quote_asset_notional_amount: fixed(400) }
    assert.equal(positionValue(loss, market, feed, collateralFeed, now), 0n)
    assert.equal(positionValue(loss, market, feed, collateralFeed, now)
        + positionValue(position, market, feed, collateralFeed, now), 121n * SCALE)
})

test('flat positions normalize withdrawable collateral but preserve dust with pending orders', () => {
    const { market, feed, position, now } = fixture()
    const collateralFeed = { price: fixed(1) }
    position.base_asset_amount = fixed(0)
    position.quote_asset_notional_amount = fixed(0)
    position.collateral = (SCALE + 1n).toString()
    assert.equal(positionValue(position, market, feed, collateralFeed, now), SCALE + 1n)
    position.pending_orders = '0'
    assert.equal(positionValue(position, market, feed, collateralFeed, now), SCALE)
    position.collateral = '999999999999'
    assert.equal(positionValue(position, market, feed, collateralFeed, now), 0n)
    position.collateral = BigInt.asUintN(256, -999999999999n).toString()
    assert.equal(positionValue(position, market, feed, collateralFeed, now), 0n)
})
