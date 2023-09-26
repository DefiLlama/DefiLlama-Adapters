const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128,
} = require('./layout-base')

const TOKEN_PARAMS = [
  u32('decimals'),
  u32('vaultBump'),
  publicKey('mintKey'),
  publicKey('vaultKey'),
]

// https://github.com/Ellipsis-Labs/phoenix-sdk/blob/4663c670bb8951b4cbf5a062c54de5cd638b231c/typescript/phoenix-sdk/src/types/MarketHeader.ts#L35
const MARKET_STATE_HEADER = struct([

  u64('discriminant'),
  u64('status'),

  struct([
    u64('bidsSize'),
    u64('asksSize'),
    u64('numSeats'),
  ], 'marketSizeParams'),
  struct(TOKEN_PARAMS, 'baseParams'),
  u64('baseLotSize'),
  struct(TOKEN_PARAMS, 'quoteParams'),
  u64('quoteLotSize'),
]);

const parsePhoenix = (account) => {
  const { data } = account;
  const buffer = Buffer.from(data.slice(0, MARKET_STATE_HEADER.span));
  return MARKET_STATE_HEADER.decode(buffer);
}

module.exports = {
  parsePhoenix,
}