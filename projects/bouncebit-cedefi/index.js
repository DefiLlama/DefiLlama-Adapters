const { cachedGraphQuery } = require('../helper/cache')
const { sumTokens, sumTokensExport } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider, } = require('../helper/solana')
const { Program } = require("@project-serum/anchor");
const cedefiFromSolana = require('./cedefiFromSolana')
const cedefiV3 = require('./cedefiV3')

// ===== inlined from ./easyBTC =====
const easyBTC = (() => {
  const ETH_EasyBTC_USD_Contract = '0xFe32277D00e57D864B8BC687d0a442D663Aa1dF6'

  const BNB_EasyBTC_USD_Contract = '0xF3FB36F32Dad91627f688e7332472d69F6C985c6'
  const BNB_EasyBTC_BTC_Contract = '0x38D239a8D33BF7424A1Df6d39cb8523cCc25DE0e'

  const STAKE_ABI =
    "function totalStaked() view returns (uint256)";

  async function ETHTvl(api) {
    const EasyBTC_USD_Staked = await api.call({  abi: STAKE_ABI, target: ETH_EasyBTC_USD_Contract})
    // usdt
    api.add(ADDRESSES.ethereum.USDT, EasyBTC_USD_Staked)
    return sumTokens({
      api
    })
  }

  async function BNBTvl(api) {
    const EasyBTC_USD_Staked = await api.call({  abi: STAKE_ABI, target: BNB_EasyBTC_USD_Contract})
    const EasyBTC_BTC_Staked = await api.call({  abi: STAKE_ABI, target: BNB_EasyBTC_BTC_Contract})
    // usdt
    api.add(ADDRESSES.bsc.USDT, EasyBTC_USD_Staked)
    // btc
    api.add(ADDRESSES.bsc.BTCB, EasyBTC_BTC_Staked)
    return sumTokens({ api })
  }

  return {
    ethereum: {
      tvl: ETHTvl,
    },
    bsc: {
      tvl: BNBTvl,
    }
  };
})()

// ===== inlined from ./premium =====
const premium = (() => {
  const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'
  const BBUSD = ADDRESSES.bouncebit.BBUSD
  // const stBBTC = '0x7F150c293c97172C75983BD8ac084c187107eA19'

  const stBBTC_STAKE_ABI =
    "function totalStaked() view returns (uint256)";

  async function bouncebitTvl(api, ...args) {
    const stBBTCStaked = await api.call({  abi: stBBTC_STAKE_ABI, target: '0x7F26aB9263E33de947654F44C5AB439090cfAaf7'})
    // stBBTC
    api.add(BBTC, stBBTCStaked)
    return sumTokens({
      owners: ["0xd4def93a10ada7e14cAdc6920b6CDE01148D1813", "0x426CD147ff93f31BB18F1Acd19DAb9c32d934131"],
      tokens: [BBTC, BBUSD],
      api,
      ...args
    })
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
})()

// ===== inlined from ./promo =====
const promo = (() => {
  const config = {
    base: {
      pool: '0x131711b38BE467212D328269482EfF626D0Ae586'
    },
    bsc: {
      simple: '0x471461A60EC3855DC58E00De81E3510b8945D2f9'
    }
  }

  const PROMO_BTCB_SIMPLE_STAKE_ABI =
    "function totalStaked() view returns (uint256)";

  // Campaign id starts from 1 and auto increments
  const promoPoolCampaignCountAbi =
    "function campaignCount() view returns (uint256)";

  const promoPoolTotalStakeAbi = "function getCampaign(uint256 _campaignId) view returns (tuple(address token, address, address, uint256, uint256, uint256 totalStaked, uint256, uint256, bool, bool, bool))";

  async function promoTvl(api) {
    if (config[api.chain]?.simple) {
      const BTCBStaked = await api.call({  abi: PROMO_BTCB_SIMPLE_STAKE_ABI, target: config[api.chain].simple})
      api.add(ADDRESSES.bsc.BTCB, BTCBStaked)
    }

    if (!config[api.chain]?.pool) return api

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

    return api.getBalances()
  }

  const _exports = {}
  Object.keys(config).forEach(chain => {
    _exports[chain] = { tvl: promoTvl }
  })
  return _exports
})()

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
  }

  async function tvl(api) {
    const provider = getProvider()
    const programId = '5HRzz8VDD9QjpEBBdq6hBUEXcssxW5mPnod4L6Qgnh9g'
    const program = new Program(minimalIdl, programId, provider)

    const vaults = await program.account.vault.all()

    vaults.map(vault => {
      const { stat } = vault.account
      const totalStaked = BigInt(stat.totalStaked.toString())
      // const totalRewards = BigInt(stat.totalRewards.toString())
      const tvlAmount = totalStaked

      if (tvlAmount > 0) {
        api.add(vault.account.tokenMint.toBase58(), tvlAmount.toString())
      }

    })

    return api.getBalances()
  }

  return {
    solana: { tvl }
  }
})()

const config = {
  ethereum: {
    subgraphUrl: 'https://api.studio.thegraph.com/query/96517/bb-defillama-eth/v0.0.4'
  },
  bsc: {
    subgraphUrl: 'https://api.studio.thegraph.com/query/96517/bb-defillama-bsc/v0.0.2',
    subgraphUrlVip: 'https://api.studio.thegraph.com/query/96517/bb-vip-defillama-bsc/v0.0.2'
  },
  bouncebit: {
    main: { url: 'https://bitswap-subgraph.bouncebit.io/subgraphs/name/bb-defillama-bb' },
    boyya: { url: 'https://bitswap-subgraph.bouncebit.io/subgraphs/name/bb-defillama-boyya-bb' }
  },
  base: {},
  solana: {}
}

const query = `{
  tokens {
    id
    tvl
  }
}`

// stbbtc to bbtc
const TOKEN_MAPPINGS = {
  '0x7f150c293c97172c75983bd8ac084c187107ea19': '0xf5e11df1ebcf78b6b6d26e04ff19cd786a1e81dc', // stBBTC -> bbtc
}

async function fetchTokens(chain, subgraphUrl, cacheKey = '') {
  const prefix = `bouncebit-cedefi${cacheKey}`
  return cachedGraphQuery(`${prefix}/${chain}`, subgraphUrl, query)
}

async function cedefiTvl(api) {
  if (api.chain === 'base') return {}
  if (api.chain === 'solana') return cedefiFromSolana[api.chain]?.tvl?.(api) || {}
  
  const chain = api.chain
  
  const tokenLists = await Promise.all(
    chain === 'bouncebit'
      ? [
          fetchTokens(chain, config[chain].main.url),
          fetchTokens(chain, config[chain].boyya.url, '-boyya')
        ]
      : chain === 'bsc'
      ? [
          fetchTokens(chain, config[chain].subgraphUrl),
          fetchTokens(chain, config[chain].subgraphUrlVip, '-vip')
        ]
      : [fetchTokens(chain, config[chain].subgraphUrl)]
  )

  const allTokens = tokenLists.flatMap(result => result.tokens)
  
  allTokens.forEach(token => {
    if (token.tvl <= 0) return
    const targetToken = TOKEN_MAPPINGS[token.id] || token.id
    api.add(targetToken, token.tvl)
  })

  return api.getBalances()
}

async function combinedTvl(api) {
  const [cedefiBalances, easyBTCBalances, premiumBalances, cedefiV3Balances, promoBalances, promoFromSolanaBalances] = await Promise.all([
    cedefiTvl(api),
    easyBTC[api.chain]?.tvl?.(api) || {},
    premium[api.chain]?.tvl?.(api) || {},
    cedefiV3[api.chain]?.tvl?.(api) || {},
    promo[api.chain]?.tvl?.(api) || {},
    promoFromSolana[api.chain]?.tvl?.(api) || {}
  ])

  // merge all balances
  return api.sumTokens([cedefiBalances, easyBTCBalances, premiumBalances, cedefiV3Balances, promoBalances, promoFromSolanaBalances])
}

module.exports = {
  methodology: "Calculate TVL by querying BounceBit Cedefi subgraph, EasyBTC and Premium protocols",
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: combinedTvl }
})