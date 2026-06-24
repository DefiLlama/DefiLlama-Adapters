const { sumTokens, sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json');
const { getProvider, } = require('../helper/solana');
const { Program } = require("@project-serum/anchor");
const cedefiFromSolana = require('./cedefiFromSolana');
const cedefiV3 = require('./cedefiV3');

// ===== inlined from ./easyBTC =====
const easyBTC = (() => {
  const ETH_EasyBTC_USD_Contract = '0xFe32277D00e57D864B8BC687d0a442D663Aa1dF6';

  const BNB_EasyBTC_USD_Contract = '0xF3FB36F32Dad91627f688e7332472d69F6C985c6';
  const BNB_EasyBTC_BTC_Contract = '0x38D239a8D33BF7424A1Df6d39cb8523cCc25DE0e';

  const STAKE_ABI =
    "function totalStaked() view returns (uint256)";

  async function ETHTvl (api) {
    const EasyBTC_USD_Staked = await api.call({ abi: STAKE_ABI, target: ETH_EasyBTC_USD_Contract });
    // usdt
    api.add(ADDRESSES.ethereum.USDT, EasyBTC_USD_Staked);
    return sumTokens({
      api
    });
  }

  async function BNBTvl (api) {
    const EasyBTC_USD_Staked = await api.call({ abi: STAKE_ABI, target: BNB_EasyBTC_USD_Contract });
    const EasyBTC_BTC_Staked = await api.call({ abi: STAKE_ABI, target: BNB_EasyBTC_BTC_Contract });
    // usdt
    api.add(ADDRESSES.bsc.USDT, EasyBTC_USD_Staked);
    // btc
    api.add(ADDRESSES.bsc.BTCB, EasyBTC_BTC_Staked);
    return sumTokens({ api });
  }

  return {
    ethereum: {
      tvl: ETHTvl,
    },
    bsc: {
      tvl: BNBTvl,
    }
  };
})();

// ===== inlined from ./premium =====
const premium = (() => {
  const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC';
  const BBUSD = ADDRESSES.bouncebit.BBUSD;
  // const stBBTC = '0x7F150c293c97172C75983BD8ac084c187107eA19'

  const stBBTC_STAKE_ABI =
    "function totalStaked() view returns (uint256)";

  async function bouncebitTvl (api, ...args) {
    const stBBTCStaked = await api.call({ abi: stBBTC_STAKE_ABI, target: '0x7F26aB9263E33de947654F44C5AB439090cfAaf7' });
    // stBBTC
    api.add(BBTC, stBBTCStaked);
    return sumTokens({
      owners: ["0xd4def93a10ada7e14cAdc6920b6CDE01148D1813", "0x426CD147ff93f31BB18F1Acd19DAb9c32d934131"],
      tokens: [BBTC, BBUSD],
      api,
      ...args
    });
  }

  return {
    ethereum: {
      tvl: sumTokensExport({
        owners: ["0x1ddD6E5eA766511CC0f348DC8d17578a821B680F", "0xa2B283e4dbdFEA5461C36a59E3B94b3ef2883085"],
        tokens: [BBTC] // removed BBUSD because its tracked on bouncebit ethena listing
      }),
    },
    bsc: {
      tvl: sumTokensExport({
        owners: ["0x55a55e8b08b091bD0529bf1af05b69fF5291867D", "0xdAfd8591402c5E57DCa4B1b9e481c08548a2442E"],
        tokens: [BBTC, BBUSD]
      }),
    },
    bouncebit: {
      tvl: bouncebitTvl
    },
  };
})();

// ===== inlined from ./promo =====
const promo = (() => {
  const config = {
    base: {
      pool: '0x131711b38BE467212D328269482EfF626D0Ae586'
    },
    bsc: {
      simple: '0x471461A60EC3855DC58E00De81E3510b8945D2f9'
    }
  };

  const PROMO_BTCB_SIMPLE_STAKE_ABI =
    "function totalStaked() view returns (uint256)";

  // Campaign id starts from 1 and auto increments
  const promoPoolCampaignCountAbi =
    "function campaignCount() view returns (uint256)";

  const promoPoolTotalStakeAbi = "function getCampaign(uint256 _campaignId) view returns (tuple(address token, address, address, uint256, uint256, uint256 totalStaked, uint256, uint256, bool, bool, bool))";

  async function promoTvl (api) {
    if (config[api.chain]?.simple) {
      const BTCBStaked = await api.call({ abi: PROMO_BTCB_SIMPLE_STAKE_ABI, target: config[api.chain].simple });
      api.add(ADDRESSES.bsc.BTCB, BTCBStaked);
    }

    if (!config[api.chain]?.pool) return api;

    const campaignCount = await api.call({
      abi: promoPoolCampaignCountAbi,
      target: config[api.chain].pool
    });

    const campaignIds = Array.from(
      { length: Number(campaignCount) },
      (_, i) => i + 1
    );

    const campaigns = await api.multiCall({
      abi: promoPoolTotalStakeAbi,
      calls: campaignIds.map(id => ({
        target: config[api.chain].pool,
        params: [id]
      }))
    });

    const tokenTvls = {};
    campaigns.forEach(campaign => {
      const { token, totalStaked } = campaign;
      if (!tokenTvls[token]) {
        tokenTvls[token] = 0n;
      }
      tokenTvls[token] = tokenTvls[token] + BigInt(totalStaked);
    });

    Object.entries(tokenTvls).forEach(([token, balance]) => {
      api.add(token, balance);
    });

    return api.getBalances();
  }

  const _exports = {};
  Object.keys(config).forEach(chain => {
    _exports[chain] = { tvl: promoTvl };
  });
  return _exports;
})();

// ===== inlined from ./promoFromSolana =====
const promoFromSolana = (() => {
  const minimalIdl = {
    "instructions": [],
    "accounts": [
      {
        "name": "Vault",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "is_vault_enable",
              "type": "bool"
            },
            {
              "name": "is_stake_enable",
              "type": "bool"
            },
            {
              "name": "is_withdraw_enable",
              "type": "bool"
            },
            {
              "name": "max_stake_amount",
              "type": "u64"
            },
            {
              "name": "lock_period",
              "type": "i64"
            },
            {
              "name": "full_stake_timestamp",
              "type": "i64"
            },
            {
              "name": "token_mint",
              "type": "publicKey"
            },
            {
              "name": "token_escrow",
              "type": "publicKey"
            },
            {
              "name": "stat",
              "type": {
                "defined": "VaultStat"
              }
            }
          ]
        }
      },
    ],
    "types": [
      {
        "name": "VaultStat",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "total_staked",
              "type": "u64"
            },
            {
              "name": "total_rewards",
              "type": "u64"
            }
          ]
        }
      },
    ]
  };

  async function tvl (api) {
    const provider = getProvider();
    const programId = '5HRzz8VDD9QjpEBBdq6hBUEXcssxW5mPnod4L6Qgnh9g';
    const program = new Program(minimalIdl, programId, provider);

    const vaults = await program.account.vault.all();

    vaults.map(vault => {
      const { stat } = vault.account;
      const totalStaked = BigInt(stat.totalStaked.toString());
      // const totalRewards = BigInt(stat.totalRewards.toString())
      const tvlAmount = totalStaked;

      if (tvlAmount > 0) {
        api.add(vault.account.tokenMint.toBase58(), tvlAmount.toString());
      }

    });

    return api.getBalances();
  }

  return {
    solana: { tvl }
  };
})();

const chains = ['ethereum', 'bsc', 'bouncebit', 'base', 'solana'];

const NATIVE = ADDRESSES.GAS_TOKEN_2; // 0xeee..eee placeholder for ETH/BNB

// CeDeFi V2: per (gateway, token, strategyId) the registered vault's getTotalInfo()
// returns (principal, shares, rewards); redeemable value locked = principal + rewards.
const V2_GATEWAY = {
  ethereum: {
    gateways: ['0xb16df6f4a58ecb26fab8e09a5195c062a08e21bc'],
    tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, NATIVE],
  },
  bsc: {
    gateways: [
      '0x777ba19c9480c158941419c5d046832a120d42c8',
      '0x64c5a52cDB80766a28b5bC627EaddE12964E8D17', // VIP gateway
    ],
    tokens: [
      ADDRESSES.bsc.USDT,
      '0x570a5d26f7765ecb712c0924e4de545b89fd43df', // SOL (Wormhole)
      ADDRESSES.bsc.BTCB,
      '0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d', // USD1
      NATIVE,
    ],
  },
  bouncebit: {
    gateways: [
      '0xc4F65Bbdd0B9eCFeaA253a65DC0601C97061a02C', // main
      '0x4d4Bd4565d3D39940886b1311f54fd3A766013be', // "boyya"
    ],
    tokens: [
      '0xf5e11df1ebcf78b6b6d26e04ff19cd786a1e81dc', // BBTC
      '0x7f150c293c97172c75983bd8ac084c187107ea19', // stBBTC
      ADDRESSES.bouncebit.BBUSD,
    ],
  },
};

// stBBTC (staked BBTC, no own price feed) -> BBTC, same 1:1 BTC value
const TOKEN_MAPPINGS = {
  '0x7f150c293c97172c75983bd8ac084c187107ea19': '0xf5e11df1ebcf78b6b6d26e04ff19cd786a1e81dc', // stBBTC -> BBTC
};

const GET_STRATEGY_IDS_ABI = 'function getStrategyIds(address token) view returns (uint256[])';
const VAULT_REGISTRIES_ABI = 'function vaultRegistries(address token, uint256 strategyId) view returns (address)';
const GET_TOTAL_INFO_ABI = 'function getTotalInfo() view returns (uint256 principal, uint256 shares, uint256 rewards)';

async function cedefiTvl (api) {
  if (api.chain === 'solana') return cedefiFromSolana[api.chain]?.tvl?.(api) || {};

  const cfg = V2_GATEWAY[api.chain];
  if (!cfg) return api.getBalances(); // base: handled by other sub-modules

  for (const gateway of cfg.gateways) {
    // strategyIds per token -> vault per (token, strategyId)
    const strategyIdLists = await api.multiCall({
      abi: GET_STRATEGY_IDS_ABI,
      target: gateway,
      calls: cfg.tokens.map(token => ({ params: [token] })),
      permitFailure: true,
    });

    const vaultCalls = [];
    cfg.tokens.forEach((token, i) => {
      ; (strategyIdLists[i] || []).forEach(strategyId => vaultCalls.push({ token, params: [token, strategyId] }));
    });
    if (!vaultCalls.length) continue;

    const vaults = await api.multiCall({ abi: VAULT_REGISTRIES_ABI, target: gateway, calls: vaultCalls });

    const infos = await api.multiCall({
      abi: GET_TOTAL_INFO_ABI,
      calls: vaults.map(target => ({ target })),
      permitFailure: true,
    });

    infos.forEach((info, i) => {
      if (!info) return;
      const token = TOKEN_MAPPINGS[vaultCalls[i].token.toLowerCase()] || vaultCalls[i].token;
      api.add(token, (BigInt(info.principal) + BigInt(info.rewards)).toString());
    });
  }

  return api.getBalances();
}

async function combinedTvl (api) {
  const [cedefiBalances, easyBTCBalances, premiumBalances, cedefiV3Balances, promoBalances, promoFromSolanaBalances] = await Promise.all([
    cedefiTvl(api),
    easyBTC[api.chain]?.tvl?.(api) || {},
    premium[api.chain]?.tvl?.(api) || {},
    cedefiV3[api.chain]?.tvl?.(api) || {},
    promo[api.chain]?.tvl?.(api) || {},
    promoFromSolana[api.chain]?.tvl?.(api) || {}
  ]);

  // merge all balances
  return api.sumTokens([cedefiBalances, easyBTCBalances, premiumBalances, cedefiV3Balances, promoBalances, promoFromSolanaBalances]);
}

module.exports = {
  methodology: "TVL is read on-chain: BounceBit CeDeFi V2/V3 positions are summed from each StrategyContract/gateway vault's principal + rewards (getTotalInfo) and the V3 portal's escrowed balances, combined with the EasyBTC, Premium and Promo staking contracts plus the Solana CeDeFi vaults.",
};

chains.forEach(chain => {
  module.exports[chain] = { tvl: combinedTvl };
});