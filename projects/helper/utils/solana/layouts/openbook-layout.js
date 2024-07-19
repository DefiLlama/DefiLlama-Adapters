const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128,
} = require('./layout-base')


class WideBits extends Layout {
  constructor(property) {
    super(8, property);
    this._lower = bits(u32(), false);
    this._upper = bits(u32(), false);
  }

  addBoolean(property) {
    if (this._lower.fields.length < 32) {
      this._lower.addBoolean(property);
    } else {
      this._upper.addBoolean(property);
    }
  }

  decode(b, offset = 0) {
    const lowerDecoded = this._lower.decode(b, offset);
    const upperDecoded = this._upper.decode(b, offset + this._lower.span);
    return { ...lowerDecoded, ...upperDecoded };
  }

  encode(src, b, offset = 0) {
    return (
      this._lower.encode(src, b, offset) +
      this._upper.encode(src, b, offset + this._lower.span)
    );
  }
}

const ACCOUNT_FLAGS_LAYOUT = new WideBits();
ACCOUNT_FLAGS_LAYOUT.addBoolean('initialized');
ACCOUNT_FLAGS_LAYOUT.addBoolean('market');
ACCOUNT_FLAGS_LAYOUT.addBoolean('openOrders');
ACCOUNT_FLAGS_LAYOUT.addBoolean('requestQueue');
ACCOUNT_FLAGS_LAYOUT.addBoolean('eventQueue');
ACCOUNT_FLAGS_LAYOUT.addBoolean('bids');
ACCOUNT_FLAGS_LAYOUT.addBoolean('asks');

function accountFlagsLayout(property = 'accountFlags') {
  return ACCOUNT_FLAGS_LAYOUT.replicate(property);
}

const MARKET_STATE_LAYOUT_V3 = struct([
  blob(5),

  accountFlagsLayout('accountFlags'),

  publicKey('ownAddress'),

  u64('vaultSignerNonce'),

  publicKey('baseMint'),
  publicKey('quoteMint'),

  publicKey('baseVault'),
  u64('baseDepositsTotal'),
  u64('baseFeesAccrued'),

  publicKey('quoteVault'),
  u64('quoteDepositsTotal'),
  u64('quoteFeesAccrued'),

  u64('quoteDustThreshold'),

  publicKey('requestQueue'),
  publicKey('eventQueue'),

  publicKey('bids'),
  publicKey('asks'),

  u64('baseLotSize'),
  u64('quoteLotSize'),

  u64('feeRateBps'),

  u64('referrerRebatesAccrued'),

  publicKey('authority'),
  publicKey('pruneAuthority'),
  publicKey('consumeEventsAuthority'),

  blob(992),

  blob(7),
]);


const MARKET_STATE_LAYOUT_V3_MINIMAL = struct([
  publicKey('baseMint'),
  publicKey('quoteMint'),

  publicKey('baseVault'),
  u64('baseDepositsTotal'),
  u64('baseFeesAccrued'),

  publicKey('quoteVault'),
  u64('quoteDepositsTotal'),
  u64('quoteFeesAccrued'),
]);

const OPEN_ORDERS_LAYOUT_V2 = struct([
  blob(5),

  accountFlagsLayout('accountFlags'),

  publicKey('market'),
  publicKey('owner'),

  u64('baseTokenFree'),
  u64('baseTokenTotal'),
  u64('quoteTokenFree'),
  u64('quoteTokenTotal'),

  u128('freeSlotBits'),
  u128('isBidBits'),

  seq(u128(), 128, 'orders'),
  seq(u64(), 128, 'clientIds'),

  u64('referrerRebatesAccrued'),

  blob(7),
]);


module.exports = {
  MARKET_STATE_LAYOUT_V3_MINIMAL,
  MARKET_STATE_LAYOUT_V3,
  OPEN_ORDERS_LAYOUT_V2
}

