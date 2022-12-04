
const { deserializeUnchecked } = require('borsh');
const BufferLayout = require("buffer-layout");
const { PublicKey } = require("@solana/web3.js");
const BN = require("bn.js");

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

class Lido {
  constructor(data) {
    Object.assign(this, data);
  }
}

class SeedRange {
  constructor(data) {
    Object.assign(this, data);
  }
}

class Validator {
  constructor(data) {
    Object.assign(this, data);
  }
}

class PubKeyAndEntry {
  constructor(data) {
    Object.assign(this, data);
  }
}

class PubKeyAndEntryMaintainer {
  constructor(data) {
    Object.assign(this, data);
  }
}

class RewardDistribution {
  constructor(data) {
    Object.assign(this, data);
  }
}

class FeeRecipients {
  constructor(data) {
    Object.assign(this, data);
  }
}

class Validators {
  constructor(data) {
    Object.assign(this, data);
  }
}

class Maintainers {
  constructor(data) {
    Object.assign(this, data);
  }
}

class ExchangeRate {
  constructor(data) {
    Object.assign(this, data);
  }
}

class Metrics {
  constructor(data) {
    Object.assign(this, data);
  }
}

class LamportsHistogram {
  constructor(data) {
    Object.assign(this, data);
  }
}

class WithdrawMetric {
  constructor(data) {
    Object.assign(this, data);
  }
}

const schema = new Map([
  [
    ExchangeRate,
    {
      kind: 'struct',
      fields: [
        ['computed_in_epoch', 'u64'],
        ['st_sol_supply', 'u64'],
        ['sol_balance', 'u64'],
      ],
    },
  ],
  [
    LamportsHistogram,
    {
      kind: 'struct',
      fields: [
        ['counts1', 'u64'],
        ['counts2', 'u64'],
        ['counts3', 'u64'],
        ['counts4', 'u64'],
        ['counts5', 'u64'],
        ['counts6', 'u64'],
        ['counts7', 'u64'],
        ['counts8', 'u64'],
        ['counts9', 'u64'],
        ['counts10', 'u64'],
        ['counts11', 'u64'],
        ['counts12', 'u64'],
        ['total', 'u64'],
      ],
    },
  ],
  [
    WithdrawMetric,
    {
      kind: 'struct',
      fields: [
        ['total_st_sol_amount', 'u64'],
        ['total_sol_amount', 'u64'],
        ['count', 'u64'],
      ],
    },
  ],
  [
    Metrics,
    {
      kind: 'struct',
      fields: [
        ['fee_treasury_sol_total', 'u64'],
        ['fee_validation_sol_total', 'u64'],
        ['fee_developer_sol_total', 'u64'],
        ['st_sol_appreciation_sol_total', 'u64'],
        ['fee_treasury_st_sol_total', 'u64'],
        ['fee_validation_st_sol_total', 'u64'],
        ['fee_developer_st_sol_total', 'u64'],
        ['deposit_amount', LamportsHistogram],
        ['withdraw_amount', WithdrawMetric],
      ],
    },
  ],
  [
    SeedRange,
    {
      kind: 'struct',
      fields: [
        ['begin', 'u64'],
        ['end', 'u64'],
      ],
    },
  ],
  [
    Validator,
    {
      kind: 'struct',
      fields: [
        ['fee_credit', 'u64'],
        ['fee_address', 'u256'],
        ['stake_seeds', SeedRange],
        ['unstake_seeds', SeedRange],
        ['stake_accounts_balance', 'u64'],
        ['unstake_accounts_balance', 'u64'],
        ['active', 'u8'],
      ],
    },
  ],
  [
    PubKeyAndEntry,
    {
      kind: 'struct',
      fields: [
        ['pubkey', 'u256'],
        ['entry', Validator],
      ],
    },
  ],
  [
    PubKeyAndEntryMaintainer,
    {
      kind: 'struct',
      fields: [
        ['pubkey', 'u256'],
        ['entry', [0]],
      ],
    },
  ],
  [
    RewardDistribution,
    {
      kind: 'struct',
      fields: [
        ['treasury_fee', 'u32'],
        ['validation_fee', 'u32'],
        ['developer_fee', 'u32'],
        ['st_sol_appreciation', 'u32'],
      ],
    },
  ],
  [
    FeeRecipients,
    {
      kind: 'struct',
      fields: [
        ['treasury_account', 'u256'],
        ['developer_account', 'u256'],
      ],
    },
  ],
  [
    Validators,
    {
      kind: 'struct',
      fields: [
        ['entries', [PubKeyAndEntry]],
        ['maximum_entries', 'u32'],
      ],
    },
  ],
  [
    Maintainers,
    {
      kind: 'struct',
      fields: [
        ['entries', [PubKeyAndEntryMaintainer]],
        ['maximum_entries', 'u32'],
      ],
    },
  ],
  [
    Lido,
    {
      kind: 'struct',
      fields: [
        ['lido_version', 'u8'],

        ['manager', 'u256'],

        ['st_sol_mint', 'u256'],

        ['exchange_rate', ExchangeRate],

        ['sol_reserve_authority_bump_seed', 'u8'],
        ['stake_authority_bump_seed', 'u8'],
        ['mint_authority_bump_seed', 'u8'],
        ['rewards_withdraw_authority_bump_seed', 'u8'],

        ['reward_distribution', RewardDistribution],

        ['fee_recipients', FeeRecipients],

        ['metrics', Metrics],

        ['validators', Validators],

        ['maintainers', Maintainers],
      ],
    },
  ],
]);

const Layouts = {
  lido: Lido,
}

const customDecoders = {
  reserve: parseReserve,
  mint: defaultParseLayout(MintLayout),
  account: defaultParseLayout(AccountLayout),
  tokenSwap: defaultParseLayout(TokenSwapLayout),
  larixReserve: defaultParseLayout(ReserveLayoutLarix),
}

function decodeAccount(layout, accountInfo) {
  if (!accountInfo.data) throw new Error('Missing account data')
  if (customDecoders[layout]) return customDecoders[layout](accountInfo)
  if (!Layouts[layout]) throw new Error('Layout not found')
  return deserializeUnchecked(schema, Layouts[layout], accountInfo.data);
}

module.exports = {
  Layouts,
  schema,
  decodeAccount,
}