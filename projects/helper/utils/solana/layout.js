
const { deserializeUnchecked } = require('borsh');
const BufferLayout = require("buffer-layout");
const { PublicKey } = require("@solana/web3.js");
const BN = require("bn.js");
const { parseLido, parseLidoValidatorList } = require('./lido')
const { struct, s32, u8, u16, seq, blob, Layout, bits, u32, } = BufferLayout

const publicKey = (property = "publicKey") => {
  const publicKeyLayout = BufferLayout.blob(32, property);

  const _decode = publicKeyLayout.decode.bind(publicKeyLayout);
  const _encode = publicKeyLayout.encode.bind(publicKeyLayout);

  publicKeyLayout.decode = (buffer, offset) => {
    const data = _decode(buffer, offset);
    return new PublicKey(data);
  };

  publicKeyLayout.encode = (key, buffer, offset) =>
    _encode(key.toBuffer(), buffer, offset);

  return publicKeyLayout;
};

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
  const layout = BufferLayout.blob(8, property);

  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (buffer, offset) => {
    const data = _decode(buffer, offset);
    return new BN(
      [...data]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  };

  layout.encode = (num, buffer, offset) => {
    const a = num.toArray().reverse();
    let b = Buffer.from(a);
    if (b.length !== 8) {
      const zeroPad = Buffer.alloc(8);
      b.copy(zeroPad);
      b = zeroPad;
    }
    return _encode(b, buffer, offset);
  };

  return layout;
};

const u64 = uint64

const uint128 = (property = "uint128") => {
  const layout = BufferLayout.blob(16, property);

  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (buffer, offset) => {
    const data = _decode(buffer, offset);
    return new BN(
      [...data]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  };

  layout.encode = (num, buffer, offset) => {
    const a = num.toArray().reverse();
    let b = Buffer.from(a);
    if (b.length !== 16) {
      const zeroPad = Buffer.alloc(16);
      b.copy(zeroPad);
      b = zeroPad;
    }

    return _encode(b, buffer, offset);
  };

  return layout;
};
const u128 = uint128

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

const LastUpdateLayout = BufferLayout.struct(
  [uint64("slot"), BufferLayout.u8("stale")],
  "lastUpdate"
);

const ReserveLayout = BufferLayout.struct([
  BufferLayout.u8("version"),

  LastUpdateLayout,

  publicKey("lendingMarket"),

  BufferLayout.struct(
    [
      publicKey("mintPubkey"),
      BufferLayout.u8("mintDecimals"),
      publicKey("supplyPubkey"),
      // @FIXME: oracle option
      // TODO: replace u32 option with generic equivalent
      // BufferLayout.u32('oracleOption'),
      publicKey("pythOracle"),
      publicKey("switchboardOracle"),
      uint64("availableAmount"),
      uint128("borrowedAmountWads"),
      uint128("cumulativeBorrowRateWads"),
      uint128("marketPrice"),
    ],
    "liquidity"
  ),

  BufferLayout.struct(
    [
      publicKey("mintPubkey"),
      uint64("mintTotalSupply"),
      publicKey("supplyPubkey"),
    ],
    "collateral"
  ),

  BufferLayout.struct(
    [
      BufferLayout.u8("optimalUtilizationRate"),
      BufferLayout.u8("loanToValueRatio"),
      BufferLayout.u8("liquidationBonus"),
      BufferLayout.u8("liquidationThreshold"),
      BufferLayout.u8("minBorrowRate"),
      BufferLayout.u8("optimalBorrowRate"),
      BufferLayout.u8("maxBorrowRate"),
      BufferLayout.struct(
        [
          uint64("borrowFeeWad"),
          uint64("flashLoanFeeWad"),
          BufferLayout.u8("hostFeePercentage"),
        ],
        "fees"
      ),
      uint64("depositLimit"),
      uint64("borrowLimit"),
      publicKey("feeReceiver"),
    ],
    "config"
  ),

  BufferLayout.blob(256, "padding"),
]);

const ReserveLayoutLarix = BufferLayout.struct(
  [
    BufferLayout.u8('version'),

    LastUpdateLayout,

    publicKey('lendingMarket'),

    BufferLayout.struct(
      [
        publicKey('mintPubkey'),
        BufferLayout.u8('mintDecimals'),
        publicKey('supplyPubkey'),
        publicKey('feeReceiver'),
        BufferLayout.u8("usePythOracle"),
        publicKey('params_1'),
        publicKey("params_2"),
        uint64('availableAmount'),
        uint128('borrowedAmountWads'),
        uint128('cumulativeBorrowRateWads'),
        uint128('marketPrice'),
        uint128('ownerUnclaimed'),
      ],
      'liquidity',
    ),

    BufferLayout.struct(
      [
        publicKey('mintPubkey'),
        uint64('mintTotalSupply'),
        publicKey('supplyPubkey'),
      ],
      'collateral'
    ),

    BufferLayout.struct(
      [
        BufferLayout.u8('optimalUtilizationRate'),
        BufferLayout.u8('loanToValueRatio'),
        BufferLayout.u8('liquidationBonus'),
        BufferLayout.u8('liquidationThreshold'),
        BufferLayout.u8('minBorrowRate'),
        BufferLayout.u8('optimalBorrowRate'),
        BufferLayout.u8('maxBorrowRate'),
        BufferLayout.struct(
          // TODO: fix flash loan fee wad
          [
            uint64('borrowFeeWad'),
            uint64('borrowInterestFeeWad'),
            uint64("flashLoanFeeWad"),
            BufferLayout.u8('hostFeePercentage'),
            BufferLayout.u8('hostFeeReceiverCount'),
            BufferLayout.blob(32 * 5, 'hostFeeReceivers'),
          ],
          'fees',
        ),
        BufferLayout.u8("depositPaused"),
        BufferLayout.u8("borrowPaused"),
        BufferLayout.u8("liquidationPaused"),
      ],
      'config'
    ),
    BufferLayout.struct(
      [
        publicKey("unCollSupply"),
        uint128('lTokenMiningIndex'),
        uint128('borrowMiningIndex'),
        uint64("totalMiningSpeed"),
        uint64("kinkUtilRate"),
      ],
      'bonus'
    ),
    BufferLayout.u8("reentry"),
    uint64("depositLimit"),
    BufferLayout.u8("isLP"),
    BufferLayout.blob(239, 'padding'),
  ],
);

const MintLayout = BufferLayout.struct([
  BufferLayout.u32('mintAuthorityOption'),
  publicKey("mintAuthority"),
  uint64('supply'),
  BufferLayout.u8("decimals"),
  BufferLayout.u8("isInitialized"),
  BufferLayout.u32("freezeAuthorityOption"),
  publicKey("freezeAuthority"),
]);

const AccountLayout = BufferLayout.struct([
  publicKey('mint'),
  publicKey('owner'),
  uint64('amount'),
  BufferLayout.u32('delegateOption'),
  publicKey('delegate'),
  BufferLayout.u8('state'),
  BufferLayout.u32('isNativeOption'),
  uint64('isNative'),
  uint64('delegatedAmount'),
  BufferLayout.u32('closeAuthorityOption'),
  publicKey('closeAuthority'),
]);

const TokenSwapLayout = BufferLayout.struct([
  BufferLayout.u8("version"),
  BufferLayout.u8("isInitialized"),
  BufferLayout.u8("bumpSeed"),
  publicKey("tokenProgramId"),
  publicKey("tokenAccountA"),
  publicKey("tokenAccountB"),
  publicKey("tokenPool"),
  publicKey("mintA"),
  publicKey("mintB"),
  publicKey("feeAccount"),
  BufferLayout.blob(8, "tradeFeeNumerator"),
  BufferLayout.blob(8, "tradeFeeDenominator"),
  BufferLayout.blob(8, "ownerTradeFeeNumerator"),
  BufferLayout.blob(8, "ownerTradeFeeDenominator"),
  BufferLayout.blob(8, "ownerWithdrawFeeNumerator"),
  BufferLayout.blob(8, "ownerWithdrawFeeDenominator"),
  BufferLayout.blob(8, "hostFeeNumerator"),
  BufferLayout.blob(8, "hostFeeDenominator"),
  BufferLayout.u8("curveType"),
  publicKey("curveParameters"),
])

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

const RAYDIUM_LIQUIDITY_STATE_LAYOUT_V4 = struct([
  u64("status"),
  u64("nonce"),
  u64("maxOrder"),
  u64("depth"),
  u64("baseDecimal"),
  u64("quoteDecimal"),
  u64("state"),
  u64("resetFlag"),
  u64("minSize"),
  u64("volMaxCutRatio"),
  u64("amountWaveRatio"),
  u64("baseLotSize"),
  u64("quoteLotSize"),
  u64("minPriceMultiplier"),
  u64("maxPriceMultiplier"),
  u64("systemDecimalValue"),
  u64("minSeparateNumerator"),
  u64("minSeparateDenominator"),
  u64("tradeFeeNumerator"),
  u64("tradeFeeDenominator"),
  u64("pnlNumerator"),
  u64("pnlDenominator"),
  u64("swapFeeNumerator"),
  u64("swapFeeDenominator"),
  u64("baseNeedTakePnl"),
  u64("quoteNeedTakePnl"),
  u64("quoteTotalPnl"),
  u64("baseTotalPnl"),
  u128("quoteTotalDeposited"),
  u128("baseTotalDeposited"),
  u128("swapBaseInAmount"),
  u128("swapQuoteOutAmount"),
  u64("swapBase2QuoteFee"),
  u128("swapQuoteInAmount"),
  u128("swapBaseOutAmount"),
  u64("swapQuote2BaseFee"),
  // amm vault
  publicKey("baseVault"),
  publicKey("quoteVault"),
  // mint
  publicKey("baseMint"),
  publicKey("quoteMint"),
  publicKey("lpMint"),
  // market
  publicKey("openOrders"),
  publicKey("marketId"),
  publicKey("marketProgramId"),
  publicKey("targetOrders"),
  publicKey("withdrawQueue"),
  publicKey("lpVault"),
  publicKey("owner"),
  // true circulating supply without lock up
  u64("lpReserve"),
  seq(u64(), 3, "padding"),
])

const RAYDIUM_REWARD_INFO = struct([
  u8("rewardState"),
  u64("openTime"),
  u64("endTime"),
  u64("lastUpdateTime"),
  u128("emissionsPerSecondX64"),
  u64("rewardTotalEmissioned"),
  u64("rewardClaimed"),
  publicKey("tokenMint"),
  publicKey("tokenVault"),
  publicKey("creator"),
  u128("rewardGrowthGlobalX64"),
])

const RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM =  struct([
  blob(8),
  u8("bump"),
  publicKey("ammConfig"),
  publicKey("creator"),
  publicKey("mintA"),
  publicKey("mintB"),
  publicKey("vaultA"),
  publicKey("vaultB"),
  publicKey("observationId"),
  u8("mintDecimalsA"),
  u8("mintDecimalsB"),
  u16("tickSpacing"),
  u128("liquidity"),
  u128("sqrtPriceX64"),
  s32("tickCurrent"),
  u16("observationIndex"),
  u16("observationUpdateDuration"),
  u128("feeGrowthGlobalX64A"),
  u128("feeGrowthGlobalX64B"),
  u64("protocolFeesTokenA"),
  u64("protocolFeesTokenB"),

  u128("swapInAmountTokenA"),
  u128("swapOutAmountTokenB"),
  u128("swapInAmountTokenB"),
  u128("swapOutAmountTokenA"),

  u8("status"),

  seq(u8(), 7, ""),

  seq(RAYDIUM_REWARD_INFO, 3, "rewardInfos"),
  seq(u64(), 16, 'tickArrayBitmap'),

  u64("totalFeesTokenA"),
  u64("totalFeesClaimedTokenA"),
  u64("totalFeesTokenB"),
  u64("totalFeesClaimedTokenB"),

  u64("fundFeesTokenA"),
  u64("fundFeesTokenB"),

  u64("startTime"),

  seq(u64(), 15 * 4 - 3, "padding"),
])

const RAYDIUM_STABLE_STATE_LAYOUT_V1 = struct([
  u64("accountType"),
  u64("status"),
  u64("nonce"),
  u64("maxOrder"),
  u64("depth"),
  u64("baseDecimal"),
  u64("quoteDecimal"),
  u64("state"),
  u64("resetFlag"),
  u64("minSize"),
  u64("volMaxCutRatio"),
  u64("amountWaveRatio"),
  u64("baseLotSize"),
  u64("quoteLotSize"),
  u64("minPriceMultiplier"),
  u64("maxPriceMultiplier"),
  u64("systemDecimalsValue"),
  u64("abortTradeFactor"),
  u64("priceTickMultiplier"),
  u64("priceTick"),
  // Fees
  u64("minSeparateNumerator"),
  u64("minSeparateDenominator"),
  u64("tradeFeeNumerator"),
  u64("tradeFeeDenominator"),
  u64("pnlNumerator"),
  u64("pnlDenominator"),
  u64("swapFeeNumerator"),
  u64("swapFeeDenominator"),
  // OutPutData
  u64("baseNeedTakePnl"),
  u64("quoteNeedTakePnl"),
  u64("quoteTotalPnl"),
  u64("baseTotalPnl"),
  u64("poolOpenTime"),
  u64("punishPcAmount"),
  u64("punishCoinAmount"),
  u64("orderbookToInitTime"),
  u128("swapBaseInAmount"),
  u128("swapQuoteOutAmount"),
  u128("swapQuoteInAmount"),
  u128("swapBaseOutAmount"),
  u64("swapQuote2BaseFee"),
  u64("swapBase2QuoteFee"),

  publicKey("baseVault"),
  publicKey("quoteVault"),
  publicKey("baseMint"),
  publicKey("quoteMint"),
  publicKey("lpMint"),

  publicKey("modelDataAccount"),
  publicKey("openOrders"),
  publicKey("marketId"),
  publicKey("marketProgramId"),
  publicKey("targetOrders"),
  publicKey("owner"),
  seq(u64("padding"), 64, "padding"),
])

// console.log(RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM.span, 'RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM')

const parseReserve = (info) => {
  const pubkey = PublicKey.default
  const { data } = info;
  const buffer = Buffer.from(data);
  const reserve = ReserveLayout.decode(buffer);

  if (reserve.lastUpdate.slot.isZero()) {
    return null;
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: reserve,
  };

  return details;
}

const defaultParseLayout = Layout => info => {
  const { data } = info;
  const buffer = Buffer.from(data);
  return Layout.decode(buffer);
}

const customDecoders = {
  reserve: parseReserve,
  lido: parseLido,
  lidoValidatorList: parseLidoValidatorList,
  mint: defaultParseLayout(MintLayout),
  account: defaultParseLayout(AccountLayout),
  tokenSwap: defaultParseLayout(TokenSwapLayout),
  larixReserve: defaultParseLayout(ReserveLayoutLarix),
  investinFund: defaultParseLayout(INVESTIN_FUND_DATA),
  openbook: defaultParseLayout(MARKET_STATE_LAYOUT_V3),
  // raydiumLPv4: defaultParseLayout(RAYDIUM_LIQUIDITY_STATE_LAYOUT_V4),
  raydiumCLMM: defaultParseLayout(RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM),
  raydiumLPStable: defaultParseLayout(RAYDIUM_STABLE_STATE_LAYOUT_V1),
}

function decodeAccount(layout, accountInfo) {
  if (!accountInfo.data) throw new Error('Missing account data')
  if (customDecoders[layout]) return customDecoders[layout](accountInfo)
  throw new Error('Layout not found: ' + layout)
}

module.exports = {
  decodeAccount,
}