const SCALE = 10n ** 18n

/** Decode Aftermath's signed, two's-complement u256 fixed-point representation. */
const signed = value => BigInt.asIntN(256, BigInt(value))

/** Multiply signed fixed-point numbers, truncating towards zero as Move IFixed does. */
const mul = (a, b) => a * b / SCALE

/** Reproduce clearing_house::mark_price from the stored oracle, TWAP and book prices. */
function markPrice(market, feed, now) {
    const state = market.market_state
    const twap = market.market_params.twap_params
    const frequency = BigInt(twap.funding_frequency_ms)
    const last = BigInt(state.funding_last_upd_ms)
    const next = last - last % frequency + frequency
    const remaining = next > now ? next - now : 0n
    const alpha = remaining * SCALE / BigInt(twap.funding_period_ms)
    const indexTwap = BigInt(feed.twap_price)
    const fundingPrice = indexTwap + mul(signed(state.premium_twap), alpha)
    const twapPrice = indexTwap + signed(state.spread_twap)
    const { best_ask_price: ask, best_bid_price: bid } = market.orderbook
    const bookPrice = ask == null || bid == null ? BigInt(feed.price) : (BigInt(ask) + BigInt(bid)) / 2n * 10n ** 9n
    return [fundingPrice, twapPrice, bookPrice].sort((a, b) => a < b ? -1 : a > b ? 1 : 0)[1]
}

/** Value one vault position in USD, including PnL/funding, with a zero floor per position. */
function positionValue(position, market, baseFeed, collateralFeed, now) {
    const base = signed(position.base_asset_amount)
    let collateral = signed(position.collateral)
    const scaling = BigInt(market.market_params.core_params.scaling_factor)
    const absCollateral = collateral < 0n ? -collateral : collateral
    if (base === 0n && absCollateral / scaling === 0n) return 0n

    // A flat position with no orders can return only whole collateral balance units.
    if (base === 0n && BigInt(position.pending_orders) === 0n && collateral > 0n)
        collateral = collateral / scaling * scaling

    const price = markPrice(market, baseFeed, now)
    const pnl = mul(base, price) - signed(position.quote_asset_notional_amount)
    const rateKey = base < 0n ? 'cum_funding_rate_short' : 'cum_funding_rate_long'
    const funding = mul(signed(market.market_state[rateKey]) - signed(position[rateKey]), -base)
    const margin = mul(collateral, BigInt(collateralFeed.price)) + pnl + funding
    return margin > 0n ? margin : 0n
}

module.exports = { SCALE, signed, mul, markPrice, positionValue }
