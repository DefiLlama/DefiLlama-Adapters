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

module.exports = {
    Lido,
    schema
}