const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128, BufferLayout,
  option, } = require('./layout-base')

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


const Hub3Layout = BufferLayout.struct([
  publicKey("issuerKey"),
  u64("price"),
  u64("totalShares"),
  u64("totalFees"),
  u8("bump"),
  u32("holders"),
  u8("migration"), // bool
  u64("a"),
  u64("b"),
  u64("d"),
])

const eSOL_feeFields = [u64('denominator'), u64('numerator')];
const eSOL_rateOfExchangeFields = [u64('denominator'), u64('numerator')];

const ESOLStakePoolLayout = BufferLayout.struct([
  // rustEnum(AccountTypeKind, 'accountType'),
  u8('accountType'),
  publicKey('manager'),
  publicKey('staker'),
  publicKey('stakeDepositAuthority'),
  u8('stakeWithdrawBumpSeed'),
  publicKey('validatorList'),
  publicKey('reserveStake'),
  publicKey('poolMint'),
  publicKey('managerFeeAccount'),
  publicKey('tokenProgramId'),
  u64('totalLamports'),
  u64('poolTokenSupply'),
  u64('lastUpdateEpoch'),
  struct([u64('unixTimestamp'), u64('epoch'), publicKey('custodian')], 'lockup'),
  struct(eSOL_feeFields, 'epochFee'),
  option(struct(eSOL_feeFields), 'nextEpochFee'),
  option(publicKey(), 'preferredDepositValidatorVoteAddress'),
  option(publicKey(), 'preferredWithdrawValidatorVoteAddress'),
  struct(eSOL_feeFields, 'stakeDepositFee'),
  struct(eSOL_feeFields, 'stakeWithdrawalFee'),
  option(struct(eSOL_feeFields), 'nextWithdrawalFee'),
  u8('stakeReferralFee'),
  option(publicKey(), 'solDepositAuthority'),
  struct(eSOL_feeFields, 'solDepositFee'),
  u8('solReferralFee'),
  option(publicKey(), 'solWithdrawAuthority'),
  struct(eSOL_feeFields, 'solWithdrawalFee'),
  option(struct(eSOL_feeFields), 'nextSolWithdrawalFee'),
  u64('lastEpochPoolTokenSupply'),
  u64('lastEpochTotalLamports'),
  option(struct(eSOL_rateOfExchangeFields), 'rateOfExchange'),
  publicKey('treasuryFeeAccount'),
  struct(eSOL_feeFields, 'treasuryFee'),
  u64('totalLamportsLiquidity'),
  u32("maxValidatorYieldPerEpochNumerator")
]);


const PARLAY_LAYOUT_PARTIAL = BufferLayout.struct([
  publicKey('mint'),
  u32("entryCount"),
  u64('entryCost'),
]);

const HH_PARI_LAYOUT_PARTIAL = BufferLayout.struct([
  publicKey('mint'),
  u64("closeTimestamp"),
  u64("resolveTimestamp"),
  u64("outcomeTimestamp"),
  u16("creatorFee"),
  u16("platformFee"),
  u8('state'),
  u8('outcome'),
  BufferLayout.seq(u64(), u8().span, 'amounts'), 
]);

const ACCESS_LAYOUT = BufferLayout.struct([
  BufferLayout.u8('tag'),
  BufferLayout.u8('bumpSeed'),
  uint64('dailyInflation'),
  publicKey('tokenMint'),
  publicKey('authority'),
  uint64('creationTime'),
  uint64('totalStaked'),
  uint64('totalStakedSnapshot'),
  uint64('lastSnapshotOffset'),
  uint128('ixGate'),
  publicKey('freezeAuthority'),
  uint128('adminIxGate'),
  BufferLayout.u16('feeBasisPoints'),
  uint64('lastFeeDistributionTime'),
  BufferLayout.u32('feeRecipientsCount'),
  BufferLayout.seq(
    BufferLayout.struct([
      publicKey('owner'),
      uint64('percentage'),
    ]),
    10,
    'recipients'
  ),
]);

const bool = BufferLayout.u8
// https://github.com/mercurial-finance/stable-swap-n-pool-js/blob/main/src/state.ts#L32
const METEORA_STABLE_SWAP_LAYOUT = BufferLayout.struct([
  BufferLayout.u8('version'),
  bool('isInitialized'),
  BufferLayout.u8('nonce'),
  u64('amplificationCoefficient'),
  u64('feeNumerator'),
  u64('adminFeeNumerator'),
  BufferLayout.u32('tokenAccountsLength'),
  u64('precisionFactor'),
  BufferLayout.seq(u64(), 4, 'precisionMultipliers'),
  BufferLayout.seq(publicKey(), 4, 'tokenAccounts'),
  publicKey('poolMint'),
  publicKey('adminTokenMint'),
  BufferLayout.struct([
    bool('swapEnabled'),
    bool('addLiquidityEnabled'),
  ]),
]);

const ZEUS_GUARDIAN_SETTING_LAYOUT = BufferLayout.struct([
  publicKey("spl_token_escrow_authority"),
  publicKey("spl_token_vault_authority"),

  u32("seed"),
  u8("status"),
  publicKey("guardian_certificate"),

  u64("max_quota"),
  u64("available_quota"),
  u64("accumulated_amount"),
  u64("penalty_rate"),
  u8("delegation_removal_lock_days"),
  u64("quota_increasing_rate"),

  u64("created_at"),
  u64("updated_at"),

  BufferLayout.seq(u8(), 64, "delegate_options"), // Adjust size based on typical vector length

  blob(128, "_padding"), // Ensuring 128-byte padding for safety
]);

// SendIt Reserve Layout
const ReserveLayoutSendit = BufferLayout.struct([
  BufferLayout.u8("version"),
  LastUpdateLayout,
  publicKey("lendingMarket"),
  
  // Liquidity section
  publicKey("liquidityMintPubkey"),
  BufferLayout.u8("liquidityMintDecimals"),
  publicKey("liquiditySupplyPubkey"),
  publicKey("liquidityPythOracle"),
  publicKey("liquiditySwitchboardOracle"),
  uint64("liquidityAvailableAmount"),
  uint128("liquidityBorrowedAmountWads"),
  uint128("liquidityCumulativeBorrowRateWads"),
  uint128("liquidityMarketPrice"),
  
  // Collateral section
  publicKey("collateralMintPubkey"),
  uint64("collateralMintTotalSupply"),
  publicKey("collateralSupplyPubkey"),
  
  // Config section
  BufferLayout.u8("optimalUtilizationRate"),
  BufferLayout.u8("loanToValueRatio"),
  BufferLayout.u8("liquidationBonus"),
  BufferLayout.u8("liquidationThreshold"),
  BufferLayout.u8("minBorrowRate"),
  BufferLayout.u8("optimalBorrowRate"),
  BufferLayout.u8("maxBorrowRate"),
  uint64("borrowFeeWad"),
  uint64("flashLoanFeeWad"),
  BufferLayout.u8("hostFeePercentage"),
  uint64("depositLimit"),
  uint64("borrowLimit"),
  publicKey("feeReceiver"),
  BufferLayout.u8("protocolLiquidationFee"),
  BufferLayout.u8("protocolTakeRate"),
  uint128("accumulatedProtocolFeesWads"),
  uint64("addedBorrowWeightBPS"),
  uint128("liquiditySmoothedMarketPrice"),
  BufferLayout.u8("reserveType"),
  BufferLayout.u8("maxUtilizationRate"),
  uint64("superMaxBorrowRate"),
  BufferLayout.u8("maxLiquidationBonus"),
  BufferLayout.u8("maxLiquidationThreshold"),
  uint64("scaledPriceOffsetBPS"),
  publicKey("extraOracle"),
  BufferLayout.u8("liquidityExtraMarketPriceFlag"),
  uint128("liquidityExtraMarketPrice"),
  uint128("attributedBorrowValue"),
  uint64("attributedBorrowLimitOpen"),
  uint64("attributedBorrowLimitClose"),
  
  // VestingFees
  uint128("rewardsPerSlot"),
  uint64("lastUpdateSlotVesting"),
  BufferLayout.u8("lastHourIndex"),
  BufferLayout.seq(uint128(), 72, "hourlyDeltas"),
  
  // LiquidityIncentives
  uint128("incentivesPerSlot"),
  uint64("lastUpdateSlotIncentives"),
  BufferLayout.u32("dailyDeltasLength"),
  BufferLayout.seq(uint128(), 365, "dailyDeltas"),
  uint128("cumulativeIncentivesPerShare"),
  publicKey("incentiveTokenMint"),
  publicKey("incentiveTokenAccount"),
  BufferLayout.u8("incentiveTokenDecimals"),
  publicKey("tokenProgramId"),
  
  BufferLayout.blob(17, "padding"),
]);

module.exports = {
  ReserveLayout, ReserveLayoutLarix, ReserveLayoutSendit, MintLayout, AccountLayout, TokenSwapLayout, ESOLStakePoolLayout, 
  PARLAY_LAYOUT_PARTIAL, HH_PARI_LAYOUT_PARTIAL, ACCESS_LAYOUT, METEORA_STABLE_SWAP_LAYOUT, ZEUS_GUARDIAN_SETTING_LAYOUT,
}

