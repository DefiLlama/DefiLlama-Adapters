const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')
const { abi } = require('./abi')

const config = {
  polygon: {
    bucketsFactory: '0x7E6915D307F434E4171cCee90e180f5021c60089',
    positionManager: '0x02bcaA4633E466d151b34112608f60A82a4F6035',
    traderBalanceVault: '0x0801896C67CF024606BcC92bd788d6Eb077CC74F',
    defaultTokens: {
      WETH: ADDRESSES.polygon.WETH_1,
      WBTC: ADDRESSES.polygon.WBTC,
      WMATIC: ADDRESSES.polygon.WMATIC_2,
      USDC: ADDRESSES.polygon.USDC,
      USDT: ADDRESSES.polygon.USDT,
      EPMX: "0xDc6D1bd104E1efa4A1bf0BBCf6E0BD093614E31A"
    },
    aaveTokens: {
      [ADDRESSES.polygon.WETH_1]: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
      [ADDRESSES.polygon.WBTC]: "0x078f358208685046a11C85e8ad32895DED33A249",
      [ADDRESSES.polygon.WMATIC_2]: "0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97",
      [ADDRESSES.polygon.USDC]: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
      [ADDRESSES.polygon.USDT]: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
    },
  },
  arbitrum: {
    bucketsFactory: '0x4e6f7372bCE4083c779c17B240A94dc2EA57AE67',
    positionManager: '0x86890E30cE9E1e13Db5560BbEb435c55567Af1cd',
    traderBalanceVault: '0xc08FFBBA8c5f42beb7e6dd29142cC61855a3076B',
    defaultTokens: {
      USDCe: ADDRESSES.arbitrum.USDC,
      USDC: ADDRESSES.arbitrum.USDC_CIRCLE,
      USDT: ADDRESSES.arbitrum.USDT,
      WETH: ADDRESSES.arbitrum.WETH,
      WBTC: ADDRESSES.arbitrum.WBTC,
      ARB: ADDRESSES.arbitrum.ARB,
      DAI: ADDRESSES.arbitrum.DAI,
      LINK: ADDRESSES.arbitrum.LINK,
      PENDLE: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8",
      GMX: ADDRESSES.arbitrum.GMX,
      GNS: "0x18c11FD286C5EC11c3b683Caa813B77f5163A122",
      RDNT: "0x3082CC23568eA640225c2467653dB90e9250AaA0",
      MAGIC: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
      JOE: "0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07",
      STG: "0x6694340fc020c5E6B96567843da2df01b2CE1eb6",
      EPMX: "0xA533f744B179F2431f5395978e391107DC76e103"
    },
    aaveTokens: {
      [ADDRESSES.arbitrum.DAI]: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
      [ADDRESSES.arbitrum.USDC]: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
      [ADDRESSES.arbitrum.USDT]: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
      [ADDRESSES.arbitrum.LINK]: "0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530",
      [ADDRESSES.arbitrum.WBTC]: "0x078f358208685046a11C85e8ad32895DED33A249",
      [ADDRESSES.arbitrum.WETH]: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
    },
  },
}

module.exports = {}

Object.keys(config).forEach(chain => {
  const { bucketsFactory, positionManager, traderBalanceVault, defaultTokens, aaveTokens } = config[chain]

  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const buckets = await api.call({ target: bucketsFactory, abi: abi.allBuckets })
      const borrowedTokensAddresses = await api.multiCall({ abi: abi.borrowedAsset, calls: buckets })

      const tokensAndOwnersBuckets = buckets.map((b, i) => [borrowedTokensAddresses[i], b])
      const aTokensAndOwnersBuckets = buckets.map((b, i) => [aaveTokens[borrowedTokensAddresses[i].toLowerCase()], b]).filter((p) => p[0])
      const tokensAndOwnersPM = Object.values(defaultTokens).map(t => [t, positionManager])
      const tokensAndOwnersTBV = Object.values(defaultTokens).map(t => [t, traderBalanceVault])

      const tokensAndOwners = tokensAndOwnersBuckets.concat(aTokensAndOwnersBuckets, tokensAndOwnersPM, tokensAndOwnersTBV)

      return sumTokens2({ api, tokensAndOwners })
    }
  }
})
