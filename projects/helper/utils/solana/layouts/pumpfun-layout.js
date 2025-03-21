const { struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128 } = require('./layout-base')

const PUMPFUN_GLOBAL_CONFIG_LAYOUT = struct([
  publicKey('admin'),
  u64('lp_fee_basis_points'),
  u64('protocol_fee_basis_points'),
  u8('disable_flags'),
  seq(publicKey(), 8, 'protocol_fee_recipients')
])

const PUMPFUN_POOL_LAYOUT = struct([
  blob(8),
  u8('pool_bump'),
  u16('index'), 
  publicKey('creator'),
  publicKey('base_mint'),
  publicKey('quote_mint'),
  publicKey('lp_mint'),
  publicKey('pool_base_token_account'),
  publicKey('pool_quote_token_account'),
  u64('lp_supply')
])

module.exports = {
  PUMPFUN_GLOBAL_CONFIG_LAYOUT,
  PUMPFUN_POOL_LAYOUT
}