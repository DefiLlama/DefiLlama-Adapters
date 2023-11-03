const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128, BufferLayout,
} = require('./layout-base')
const BN = require("bn.js");

function U64F64(property = "u64F64") {

  const layout = BufferLayout.blob(16, property);

  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (buffer, offset) => {
    const raw = new BN(_decode(buffer, offset), 10, 'le');

    return raw / Math.pow(2, 64);
  };

  layout.encode = (key, buffer, offset) =>
    _encode(key.toBuffer(), buffer, offset);

  return layout;
}

const INVESTIN_FUND_DATA = struct([
  u8('is_initialized'),
  u8('number_of_active_investments'),
  u8('no_of_investments'),
  u8('signer_nonce'),
  u8('no_of_margin_positions'),
  u8('no_of_assets'),
  u16('position_count'),

  u8('version'),
  u8('is_private'),
  u16('fund_v3_index'),
  seq(u8(), 4, 'padding'),

  u64('min_amount'),
  U64F64('min_return'),
  U64F64('performance_fee_percentage'),
  U64F64('total_amount'),
  U64F64('prev_performance'),

  u64('amount_in_router'),
  U64F64('performance_fee'),
  publicKey('manager_account'),
  publicKey('fund_pda'),
  seq(
    struct([
      u8('is_active'),
      seq(u8(), 3, 'index'),
      u8('mux'),
      u8('is_on_mango'),
      seq(u8(), 2, 'padding'),
      u64('balance'),
      u64('debt'),
      publicKey('vault')
    ]),
    8, 'tokens'
  ),
  seq(publicKey(), 10, 'investors'),

  struct([
    publicKey('mango_account'),
    seq(u8(), 3, 'perp_markets'),
    u8('padding'),
    u8('deposit_index'),
    u8('markets_active'),
    u8('deposits_active'),
    u8('xpadding'),
    seq(u64(), 2, 'investor_debts'),
    seq(u8('padding'), 24),
  ], 'mango_positions'),


  struct([
    u8('is_active'),
    u8('is_split'),
    u8('hop'),
    u8('count'),
    u8('token_in_slot'),
    u8('token_out_slot'),
    seq(u8('padding'), 2),

    publicKey('token_in'),
    publicKey('token_out'),
    u64('amount_in'),
    u64('min_amount_out'),
  ], 'guard'),

  seq(
    struct([
      u64('price'),
      u64('max_base_quantity'),
      u64('max_quote_quantity'),
      u64('client_order_id'),
      u64('expiry_timestamp'),
      u8('is_repost_processing'),
      u8('perp_market_id'),
      u8('side'),
      u8('reduce_only'),
      u8('limit'),
      seq(u8(), 3, 'padding'),
    ]),
    2, 'limit_orders'
  ),

  struct([
    u64('last_updated'),
    publicKey('volt_vault_id'),
    u64('total_value_in_ul'),
    u64('fc_token_balance'),
    u64('ul_token_balance'),
    u64('fc_token_debt'),
    u64('ul_debt'),
    u8('ul_token_slot'),
    u8('is_active'),
    seq(u8('padding'), 6),
  ], 'friktion_vault'),

  seq(u8(), 1864, 'migration_additonal_padding'),
])


module.exports = {
  INVESTIN_FUND_DATA,
}

