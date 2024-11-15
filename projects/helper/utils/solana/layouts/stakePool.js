const {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128,
} = require('./layout-base')

// https://github.com/solana-labs/solana-program-library/blob/master/stake-pool/js/src/layouts.ts

const feeFields = [u64('denominator'), u64('numerator')];

// https://github.com/solana-labs/solana-program-library/blob/master/stake-pool/js/src/codecs.ts
class OptionLayout extends Layout {
  // layout;
  // discriminator;

  constructor(layout, property) {
    super(-1, property);
    this.layout = layout;
    this.discriminator = u8();
  }

  encode(src, b, offset = 0) {
    if (src === null || src === undefined) {
      return this.discriminator.encode(0, b, offset);
    }
    this.discriminator.encode(1, b, offset);
    return this.layout.encode(src, b, offset + 1) + 1;
  }

  decode(b, offset = 0) {
    const discriminator = this.discriminator.decode(b, offset);
    if (discriminator === 0) {
      return null;
    } else if (discriminator === 1) {
      return this.layout.decode(b, offset + 1);
    }
    throw new Error('Invalid option ' + this.property);
  }

  getSpan(b, offset = 0) {
    const discriminator = this.discriminator.decode(b, offset);
    if (discriminator === 0) {
      return 1;
    } else if (discriminator === 1) {
      return this.layout.getSpan(b, offset + 1) + 1;
    }
    throw new Error('Invalid option ' + this.property);
  }
}

function option(layout, property) {
  return new OptionLayout(layout, property);
}

class FutureEpochLayout extends Layout {
  // layout: Layout;
  // discriminator: Layout<number>;

  constructor(layout, property) {
    super(-1, property);
    this.layout = layout;
    this.discriminator = u8();
  }

  encode(src, b, offset = 0) {
    if (src === null || src === undefined) {
      return this.discriminator.encode(0, b, offset);
    }
    // This isn't right, but we don't typically encode outside of tests
    this.discriminator.encode(2, b, offset);
    return this.layout.encode(src, b, offset + 1) + 1;
  }

  decode(b, offset = 0) {
    const discriminator = this.discriminator.decode(b, offset);
    if (discriminator === 0) {
      return null;
    } else if (discriminator === 1 || discriminator === 2) {
      return this.layout.decode(b, offset + 1);
    }
    throw new Error('Invalid future epoch ' + this.property);
  }

  getSpan(b, offset = 0) {
    const discriminator = this.discriminator.decode(b, offset);
    if (discriminator === 0) {
      return 1;
    } else if (discriminator === 1 || discriminator === 2) {
      return this.layout.getSpan(b, offset + 1) + 1;
    }
    throw new Error('Invalid future epoch ' + this.property);
  }
}

function futureEpoch(layout, property) {
  return new FutureEpochLayout(layout, property);
}

const STAKE_POOL_LAYOUT = struct([
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
  struct(feeFields, 'epochFee'),
  futureEpoch(struct(feeFields), 'nextEpochFee'),
  option(publicKey(), 'preferredDepositValidatorVoteAddress'),
  option(publicKey(), 'preferredWithdrawValidatorVoteAddress'),
  struct(feeFields, 'stakeDepositFee'),
  struct(feeFields, 'stakeWithdrawalFee'),
  futureEpoch(struct(feeFields), 'nextStakeWithdrawalFee'),
  u8('stakeReferralFee'),
  option(publicKey(), 'solDepositAuthority'),
  struct(feeFields, 'solDepositFee'),
  u8('solReferralFee'),
  option(publicKey(), 'solWithdrawAuthority'),
  struct(feeFields, 'solWithdrawalFee'),
  futureEpoch(struct(feeFields), 'nextSolWithdrawalFee'),
  u64('lastEpochPoolTokenSupply'),
  u64('lastEpochTotalLamports'),
]);

module.exports = {
  STAKE_POOL_LAYOUT
}

