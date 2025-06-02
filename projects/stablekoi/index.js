const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const tokensAndOwners = [];
  const poolInfo = await getConfig('stable-koi-v0', "https://app.stablekoi.com/lists/poollist.json");
  poolInfo.forEach((pool) => {
    pool.tokens.forEach((token) => tokensAndOwners.push([token, pool.address]));
  });
  return api.sumTokens({ tokensAndOwners })
}

async function tvl_v1(api) {
  const tokensAndOwners = [];
  v1Pools.forEach((pool) => {
    pool.tokens.forEach((token) => tokensAndOwners.push([token.address, pool.address]));
  });
  return api.sumTokens({ tokensAndOwners })
}

async function staking(api) {
  const koi = "0xd66eb642eE33837531FdA61eb7Ab15B15658BcaB";
  const koiStakingRewards = "0x9d7AACf560e493A7B0666d85BDE216d6d38Ec429";
  const totalStakedKOI = await api.call({ abi: 'erc20:totalSupply', target: koiStakingRewards })
  api.add(koi, totalStakedKOI)
}

module.exports = {
  godwoken: {
    tvl,
    staking,
  },
  godwoken_v1: {
    tvl: tvl_v1,
  },
  hallmarks: [
    ['2022-08-26', "Add godwoken v1 chain tvl"],
  ],
}

const v1Pools = [
  {
    "address": "0xB76B94bA69f0C2c556ee86F57e57F5F20A705d18",
    "tokens": [
      {
        "address": "0x186181e225dc1Ad85a4A94164232bD261e351C33",
      },
      { "address": ADDRESSES.godwoken_v1.USDC_bsc, }
    ]
  },
  {
    "address": "0xA1F83F8F142c1069d33a898498AFEA6257387133",
    "tokens": [
      { "address": "0x186181e225dc1Ad85a4A94164232bD261e351C33", },
      { "address": "0x8E019acb11C7d17c26D334901fA2ac41C1f44d50", }
    ]
  },
  {
    "address": "0x2c13f5DB105C6ab13ba183Abb7c0CBe38bE45A92",
    "tokens": [
      { "address": "0x8E019acb11C7d17c26D334901fA2ac41C1f44d50", },
      { "address": ADDRESSES.godwoken_v1.USDT_bsc, }
    ]
  },
  {
    "address": "0x2360D9699dc82b684F986fBcc2ddf3Ab54Ff60dD",
    "tokens": [
      { "address": ADDRESSES.godwoken_v1.WBTC_eth, },
      { "address": ADDRESSES.godwoken_v1.BTCB_bsc, }
    ]
  }
]